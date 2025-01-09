import {
    Controller,
    Description,
    Param,
    Command,
    Option
} from "@wocker/core";

import {OllamaService} from "../services/OllamaService";


@Controller()
export class OllamaController {
    public constructor(
        protected readonly ollamaService: OllamaService
    ) {}

    @Command("ollama:create [name]")
    @Description("Creates a new Ollama service. Specify the optional name or enter it when prompted.")
    public async create(
        @Param("name")
        name?: string
    ): Promise<void> {
        await this.ollamaService.create(name);
    }

    @Command("ollama:destroy <name>")
    @Description("Destroys a specified Ollama instance with options to force and confirm deletion.")
    public async destroy(
        @Param("name")
        name: string,
        @Option("force", {
            type: "boolean",
            alias: "f",
            description: "Force deletion"
        })
        force?: boolean,
        @Option("yes", {
            type: "boolean",
            alias: "y",
            description: "Automatically confirm deletion"
        })
        yes?: boolean
    ): Promise<void> {
        await this.ollamaService.destroy(name, force, yes);
    }

    @Command("ollama:ls")
    @Description("Lists all available Ollama instances in a tabular format")
    public async list(): Promise<string> {
        return this.ollamaService.listTable();
    }

    @Command("ollama:start [name]")
    @Description("Starting ollama service")
    public async start(
        @Param("name")
        name?: string,
        @Option("restart", {
            alias: "r",
            description: "Restarting ollama service"
        })
        restart?: boolean
    ): Promise<void> {
        await this.ollamaService.start(name, restart);
    }

    @Command("ollama:stop [name]")
    @Description("Stopping ollama service")
    public async stop(
        @Param("name")
        name?: string
    ): Promise<void> {
        await this.ollamaService.stop(name);
    }

    @Command("ollama:run <name> <model>")
    @Description("Runs ollama model")
    public async run(
        @Param("name")
        name: string,
        @Param("model")
        model: string
    ): Promise<void> {
        await this.ollamaService.run(name, model);
    }
}
