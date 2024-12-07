import {Config, ConfigProperties} from "@wocker/core";


export type ServiceProps = ConfigProperties & {
    volume?: string;
};

export class Service extends Config<ServiceProps> {
    public volume: string;

    public constructor(props: ServiceProps) {
        super(props);

        const {
            name,
            volume = `wocker-ollama-${name}`
        } = props;

        this.volume = volume;
    }

    public get containerName(): string {
        return `ollama-${this.name}.ws`;
    }
}
