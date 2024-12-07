import {Plugin} from "@wocker/core";

import {OllamaController} from "./controllers/OllamaController";
import {OllamaService} from "./services/OllamaService";


@Plugin({
    name: "ollama",
    controllers: [
        OllamaController
    ],
    providers: [
        OllamaService
    ]
})
export default class OllamaPlugin {}
