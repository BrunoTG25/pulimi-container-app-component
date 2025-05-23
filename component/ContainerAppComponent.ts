import * as pulumi from "@pulumi/pulumi";
import * as azure_native from "@pulumi/azure-native";

export interface ContainerAppArgs {
  name: string;
  resourceGroupName: pulumi.Input<string>;
  location: pulumi.Input<string>;
  image: pulumi.Input<string>;
  cpu?: number;
  memory?: number;
  environmentId: pulumi.Input<string>;
}

export class ContainerAppComponent extends pulumi.ComponentResource {
  public readonly containerApp: azure_native.app.ContainerApp;

  constructor(name: string, args: ContainerAppArgs, opts?: pulumi.ComponentResourceOptions) {
    super("custom:components:ContainerAppComponent", name, {}, opts);

    const cpu = args.cpu ?? 0.5;
    const memory = args.memory ?? 1.0;

    this.containerApp = new azure_native.app.ContainerApp(name, {
      resourceGroupName: args.resourceGroupName,
      location: args.location,
      managedEnvironmentId: args.environmentId,
      configuration: {
        ingress: {
          external: true,
          targetPort: 80,
        },
      },
      template: {
        containers: [{
          name: name,
          image: args.image,
          resources: {
            cpu: cpu,
            memory: `${memory}Gi`,
          },
        }],
        scale: {
          minReplicas: 1,
          maxReplicas: 3,
        },
      },
    }, { parent: this });

    this.registerOutputs({
      containerApp: this.containerApp,
    });
  }
}
