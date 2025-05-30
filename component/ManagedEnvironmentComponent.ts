import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";

export interface ManagedEnvironmentArgs {
    name: pulumi.Input<string>;
    location: pulumi.Input<string>;
    resourceGroupName: pulumi.Input<string>;
    subnetId: pulumi.Input<string>;
}

export class ManagedEnvironmentComponent extends pulumi.ComponentResource {
    public readonly environment: azure.app.ManagedEnvironment;
    public readonly environmentId: pulumi.Output<string>; 

    constructor(name: string, args: ManagedEnvironmentArgs, opts?: pulumi.ComponentResourceOptions) {
        super("custom:container:ManagedEnvironmentComponent", name, {}, opts);

        // Creo el Managed Environment
         this.environment = new azure.app.ManagedEnvironment(`${name}-env`, {
            environmentName: args.name,
            resourceGroupName: args.resourceGroupName,
            location: args.location,
            vnetConfiguration: {
                infrastructureSubnetId: args.subnetId,
            },
        }, { parent: this });

        this.environmentId = this.environment.id;
       
        this.registerOutputs({
            environmentId: this.environment.id,
        });
    }
}