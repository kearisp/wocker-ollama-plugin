import {
    Controller,
    Description,
    Command,
    Option
} from "@wocker/core";

import {OllamaService} from "../services/OllamaService";


@Controller()
export class OllamaController {
    public constructor(
        protected readonly ollamaService: OllamaService
    ) {}

    @Command("ollama:start")
    @Description("Starting ollama service")
    public async start(
        @Option("restart", {
            alias: "r",
            description: "Restarting ollama service"
        })
        restart?: boolean
    ): Promise<void> {
        await this.ollamaService.start(restart);
    }

    @Command("ollama:stop")
    @Description("Stopping ollama service")
    public async stop(): Promise<void> {
        await this.ollamaService.stop();
    }
}
