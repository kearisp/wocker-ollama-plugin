import {
    Injectable,
    DockerService
} from "@wocker/core";


@Injectable()
export class OllamaService {
    protected containerName: string = "ollama.ws";
    protected imageName: string = "ollama/ollama";

    public constructor(
        protected readonly dockerService: DockerService
    ) {}

    public async start(restart?: boolean): Promise<void> {
        let container = await this.dockerService.getContainer(this.containerName);

        if(restart && container) {
            await this.dockerService.removeContainer(this.containerName);

            container = null;
        }

        if(!container) {
            container = await this.dockerService.createContainer({
                name: this.containerName,
                image: this.imageName,
                env: {
                    VIRTUAL_HOST: this.containerName,
                    VIRTUAL_PORT: "11434"
                },
                volumes: [
                    "wocker-ollama-default:/root/.ollama"
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
        }
    }

    public async stop(): Promise<void> {
        await this.dockerService.removeContainer(this.containerName);
    }

    public async run(model: string): Promise<void> {
        await this.dockerService.exec(this.containerName, {
            cmd: ["ollama", "run", model],
            tty: true
        });
    }
}
