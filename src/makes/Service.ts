import {Config, ConfigProperties} from "@wocker/core";


export type ServiceProps = ConfigProperties & {
    imageName?: string;
    imageVersion?: string;
    volume?: string;
};

export class Service extends Config<ServiceProps> {
    public imageName?: string;
    public imageVersion?: string;
    public volume: string;

    public constructor(props: ServiceProps) {
        super(props);

        const {
            name,
            imageName,
            imageVersion,
            volume = `wocker-ollama-${name}`
        } = props;

        this.imageName = imageName;
        this.imageVersion = imageVersion;
        this.volume = volume;
    }

    public get imageTag(): string {
        let imageName = this.imageName,
            imageVersion = this.imageVersion;

        if(!imageName) {
            imageName = "ollama/ollama";
        }

        if(!imageVersion) {
            return imageName;
        }

        return `${imageName}:${imageVersion}`;
    }

    public get containerName(): string {
        return `ollama-${this.name}.ws`;
    }
}
