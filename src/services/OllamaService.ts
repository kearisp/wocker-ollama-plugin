import {
    Injectable,
    AppConfigService,
    DockerService
} from "@wocker/core";


@Injectable()
export class OllamaService {
    protected containerName: string = "ollama.ws";
    protected imageName: string = "ollama/ollama";

    public constructor(
        protected readonly dockerService: DockerService
    ) {}

    public async start(restart?: boolean, rebuild?: boolean) {
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
                    VIRTUAL_HOST: this.containerName
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
            await container.start();
        }
    }

    public async stop() {
        await this.dockerService.removeContainer(this.containerName);
    }
}
