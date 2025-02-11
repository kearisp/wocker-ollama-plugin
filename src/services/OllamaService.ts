import {
    Injectable,
    AppConfigService,
    PluginConfigService,
    DockerService,
    ProxyService,
    FileSystem,
    Inject,
    PLUGIN_DIR_KEY
} from "@wocker/core";
import CliTable from "cli-table3";
import {promptText, promptConfirm} from "@wocker/utils";

import {Config} from "../makes/Config";
import {Service, ServiceProps} from "../makes/Service";


@Injectable()
export class OllamaService {
    protected _config?: Config;

    public constructor(
        protected readonly appConfigService: AppConfigService,
        protected readonly pluginConfigService: PluginConfigService,
        protected readonly proxyService: ProxyService,
        protected readonly dockerService: DockerService,
        @Inject(PLUGIN_DIR_KEY)
        protected readonly pluginDir: string
    ) {}

    public get fs(): FileSystem {
        if(!this.pluginDir) {
            throw new Error("Plugin dir not provided");
        }

        return new FileSystem(this.pluginDir);
    }

    public get config(): Config {
        if(!this._config) {
            const fs = this.fs;

            const data = fs.exists("config.json")
                ? fs.readJSON("config.json")
                : {};

            this._config = new class extends Config {
                public save(): void {
                    if(!fs.exists()) {
                        fs.mkdir("", {
                            recursive: true
                        });
                    }

                    fs.writeJSON("config.json", this.toObject());
                }
            }(data);
        }

        return this._config;
    }

    public async create(props: Partial<ServiceProps> = {}): Promise<void> {
        if(props.name && this.config.hasService(props.name)) {
            console.info(`Service "${props.name}" is already exists`);
            delete props.name;
        }

        if(!props.name) {
            props.name = await promptText({
                message: "Ollama service name:",
                type: "string",
                validate: (name?: string) => {
                    if(!name) {
                        return "Service name is required";
                    }

                    if(this.config.hasService(name)) {
                        return "Service already exists";
                    }

                    return true;
                }
            }) as string;
        }

        const service = new Service(props as ServiceProps);

        this.config.setService(service);

        this.config.save();
    }

    public async upgrade(props: Partial<ServiceProps> = {}): Promise<void> {
        const service = this.config.getServiceOrDefault(props.name);
        let changed = false;

        if(props.imageName) {
            service.imageName = props.imageName;
            changed = true;
        }

        if(props.imageVersion) {
            service.imageVersion = props.imageVersion;
            changed = true;
        }

        if(props.volume) {
            service.volume = props.volume;
            changed = true;
        }

        if(changed) {
            this.config.setService(service);
            this.config.save();
        }
    }

    public async destroy(name: string, force?: boolean, yes?: boolean): Promise<void> {
        const service = this.config.getService(name);

        if(!force && service.name === this.config.default) {
            throw new Error(`Can't destroy default service`);
        }

        if(!yes) {
            const confirm = await promptConfirm({
                message: `Are you sure you want to delete the "${name}" service? This action cannot be undone and all data will be lost.`,
                default: false
            });

            if(!confirm) {
                throw new Error("Aborted");
            }
        }

        if(!this.pluginConfigService.isVersionGTE("1.0.19")) {
            throw new Error("Please update wocker for using volume storage");
        }

        await this.dockerService.removeContainer(service.containerName);

        if(await this.dockerService.hasVolume(service.volume)) {
            await this.dockerService.rmVolume(service.volume);
        }

        this.config.unsetService(service.name);
        this.config.save();
    }

    public async listTable(): Promise<string> {
        const table = new CliTable({
            head: ["Name"]
        });

        for(const service of this.config.services) {
            table.push([service.name]);
        }

        return table.toString();
    }

    public async use(name: string): Promise<void> {
        const service = this.config.getService(name);

        this.config.default = service.name;

        this.config.save();
    }

    public async start(name?: string, restart?: boolean): Promise<void> {
        if(!name && !this.config.default) {
            await this.create();
        }

        const service = this.config.getServiceOrDefault(name);

        let container = await this.dockerService.getContainer(service.containerName);

        if(restart && container) {
            await this.dockerService.removeContainer(service.containerName);

            container = null;
        }

        if(!container) {
            if(!this.pluginConfigService.isVersionGTE("1.0.19")) {
                throw new Error("Please update wocker for using volume storage");
            }

            if(!await this.dockerService.hasVolume(service.volume)) {
                await this.dockerService.createVolume(service.volume);
            }

            container = await this.dockerService.createContainer({
                name: service.containerName,
                image: service.imageTag,
                env: {
                    VIRTUAL_HOST: service.containerName,
                    VIRTUAL_PORT: "80",
                    OLLAMA_HOST: "0.0.0.0:80"
                },
                volumes: [
                    `${service.volume}:/root/.ollama`
                ]
            });
        }

        const {
            State: {
                Running
            }
        } = await container.inspect();

        if(!Running) {
            console.info("Starting ollama...");
            await container.start();
            await this.proxyService.start();
        }

        console.info("Don't forget to add these lines into hosts file:");
        console.info(`127.0.0.1 ${service.containerName}`);
    }

    public async stop(name?: string): Promise<void> {
        const service = this.config.getServiceOrDefault(name);

        await this.dockerService.removeContainer(service.containerName);
    }

    public async run(name: string, model: string): Promise<void> {
        const service = this.config.getServiceOrDefault(name);

        await this.dockerService.exec(service.containerName, {
            cmd: ["ollama", "run", model],
            tty: true
        });
    }
}
