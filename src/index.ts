import {Plugin, PluginConfigService} from "@wocker/core";

import {OllamaController} from "./controllers/OllamaController";
import {OllamaService} from "./services/OllamaService";


@Plugin({
    name: "ollama",
    controllers: [
        OllamaController
    ],
    providers: [
        PluginConfigService,
        OllamaService
    ]
})
export default class OllamaPlugin {}
