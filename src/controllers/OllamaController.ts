import {
    Controller,
    Completion,
    Description,
    Param,
    Command,
    Option
} from "@wocker/core";
import {OllamaService} from "../services/OllamaService";


@Controller()
@Description("Ollama commands")
export class OllamaController {
    public constructor(
        protected readonly ollamaService: OllamaService
    ) {}

    @Command("ollama:ls")
    @Description("Lists all available Ollama instances in a tabular format")
    public async list(): Promise<string> {
        return this.ollamaService.listTable();
    }

    @Command("ollama:create [name]")
    @Description("Creates a new Ollama service. Specify the optional name or enter it when prompted.")
    public async create(
        @Param("name")
        @Description("Unique identifier for the Ollama service instance")
        name?: string,
        @Option("image", "i")
        @Description("Docker image name for the Ollama service (e.g., 'ollama/ollama')")
        imageName?: string,
        @Option("image-version", "I")
        @Description("Specific version tag for the Docker image (e.g., 'latest', '0.1.0')")
        imageVersion?: string,
        @Option("volume", "v")
        @Description("Name of the Docker volume to persist Ollama data")
        volume?: string
    ): Promise<void> {
        await this.ollamaService.create({
            name,
            imageName,
            imageVersion,
            volume
        });
    }

    @Command("ollama:upgrade [name]")
    @Description("Upgrade ollama service configuration.")
    public async upgrade(
        @Param("name")
        @Description("Name of the Ollama service instance to upgrade")
        name?: string,
        @Option("image", "i")
        @Description("Docker image name for the Ollama service (e.g., 'ollama/ollama')")
        imageName?: string,
        @Option("image-version", "I")
        @Description("Specific version tag for the Docker image (e.g., 'latest', '0.1.0')")
        imageVersion?: string,
        @Option("volume", "v")
        @Description("Name of the Docker volume to persist Ollama data")
        volume?: string
    ): Promise<void> {
        await this.ollamaService.upgrade({
            name,
            imageName,
            imageVersion,
            volume
        });
    }

    @Command("ollama:destroy <name>")
    @Description("Destroys a specified Ollama instance with options to force and confirm deletion.")
    public async destroy(
        @Param("name")
        @Description("Name of the Ollama service instance to run the model on")
        name: string,
        @Option("force", "f")
        @Description("Force deletion")
        force?: boolean,
        @Option("yes", "y")
        @Description("Automatically confirm deletion")
        yes?: boolean
    ): Promise<void> {
        await this.ollamaService.destroy(name, force, yes);
    }

    @Command("ollama:start [name]")
    @Description("Starting ollama service")
    public async start(
        @Param("name")
        @Description("Name of the Ollama service instance to run the model on")
        name?: string,
        @Option("restart", "r")
        @Description("Restarting ollama service")
        restart?: boolean
    ): Promise<void> {
        await this.ollamaService.start(name, restart);
    }

    @Command("ollama:stop [name]")
    @Description("Stopping ollama service")
    public async stop(
        @Param("name")
        @Description("Name of the Ollama service instance to run the model on")
        name?: string
    ): Promise<void> {
        await this.ollamaService.stop(name);
    }

    @Command("ollama:use [name]")
    @Description("Sets a specified Ollama service as the default or retrieves the current default service name if no service is specified.")
    public async use(
        @Param("name")
        name?: string
    ): Promise<string | void> {
        return this.ollamaService.use(name);
    }

    @Command("ollama:run <model>")
    @Description("Runs ollama model")
    public async run(
        @Param("model")
        @Description("Name of the AI model to run (e.g., 'llama2', 'mistral')")
        model: string,
        @Option("name", "n")
        @Description("Name of the Ollama service instance to run the model on")
        name?: string
    ): Promise<void> {
        await this.ollamaService.run(name, model);
    }

    @Command("ollama:models")
    @Description("Lists all available models in the Ollama service")
    public async modelList(
        @Option("name", "n")
        @Description("Name of the Ollama service instance to list models from")
        name?: string
    ): Promise<void> {
        await this.ollamaService.list(name);
    }

    @Command("ollama:rm <model>")
    @Description("Removes a specified model from the Ollama service")
    public async rm(
        @Param("model")
        @Description("Name of the model to remove")
        model: string,
        @Option("name", "n")
        @Description("Name of the Ollama service instance to remove the model from")
        name?: string
    ): Promise<void> {
        await this.ollamaService.rm(name, model);
    }

    @Command("ollama:logs")
    public async logs(
        @Option("name", "n")
        @Description("Name of the service")
        name?: string
    ): Promise<void> {
        await this.ollamaService.logs(name);
    }

    @Completion("name")
    public getServiceNames(): string[] {
        return this.ollamaService.services.map((service) => service.name);
    }
}
