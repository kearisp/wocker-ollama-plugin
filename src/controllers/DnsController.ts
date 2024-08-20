import {
    Controller,
    Command,
    Completion,
    AppEventsService,
    ProjectService,
    Project,
    Option
} from "@wocker/core";

import {DnsService} from "../services/DnsService";


@Controller()
export class DnsController {
    public constructor(
        protected readonly appEventsService: AppEventsService,
        protected readonly projectService: ProjectService,
        protected readonly dnsService: DnsService
    ) {
        this.appEventsService.on("project:init", (project: Project): Promise<void> => this.dnsService.onProjectInit(project));
        this.appEventsService.on("project:start", (project: Project): Promise<void> => this.dnsService.onProjectStart(project));
        this.appEventsService.on("project:stop", (project: Project): Promise<void> => this.dnsService.onProjectStop(project));
    }

    @Command("dns:init")
    public async init(
        @Option("name", {
            type: "string",
            alias: "n"
        })
        name?: string
    ): Promise<void> {
        if(name) {
            await this.projectService.cdProject(name);
        }

        const project = await this.projectService.get();

        await this.dnsService.init(project);
    }

    @Command("dns:start")
    public async start(
        @Option("name", {
            type: "string",
            alias: "n",
            description: "The name of the project"
        })
        name?: string,
        @Option("restart", {
            type: "boolean",
            alias: "r",
            description: "Restart proxy"
        })
        restart?: boolean,
        @Option("rebuild", {
            type: "boolean",
            alias: "b",
            description: "Rebuild proxy image"
        })
        rebuild?: boolean
    ): Promise<void> {
        if(name) {
            await this.projectService.cdProject(name);
        }

        const project = await this.projectService.get();

        await this.dnsService.start(project, restart, rebuild);
    }

    @Command("dns:stop")
    public async stop(
        @Option("name", {
            type: "string",
            alias: "n",
            description: "The name of the project"
        })
        name?: string
    ): Promise<void> {
        if(name) {
            await this.projectService.cdProject(name);
        }

        const project = await this.projectService.get();

        await this.dnsService.stop(project);
    }

    @Completion("name")
    public async getProjectNames(): Promise<string[]> {
        const projects = await this.projectService.search({});

        return projects.map((project) => project.name);
    }
}
