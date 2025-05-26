import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";

export interface NetworkComponentArgs {
    resourceGroupName: pulumi.Input<string>;
    location: pulumi.Input<string>;
    vnetName: pulumi.Input<string>;
    subnetName: pulumi.Input<string>;
    nsgName: pulumi.Input<string>;
}

export class NetworkComponent extends pulumi.ComponentResource {
    public readonly subnetId: pulumi.Output<string>;

      constructor(name: string, args: NetworkComponentArgs, opts?: pulumi.ComponentResourceOptions) {
        super("custom:network:NetworkComponent", name, {}, opts);

        //Creo la Vnet, Subnet y NSG


        const vnet = new azure.network.VirtualNetwork(`${name}-vnet`, {
            resourceGroupName: args.resourceGroupName,
            location: args.location,
            virtualNetworkName: args.vnetName,
            addressSpace: { addressPrefixes: ["10.0.0.0/16"] },
        }, { parent: this });

           const subnet = new azure.network.Subnet(`${name}-subnet`, {
            resourceGroupName: args.resourceGroupName,
            virtualNetworkName: vnet.name,
            subnetName: args.subnetName,
            addressPrefix: "10.0.0.0/24",
            delegations: [{
                name: "delegation",
                serviceName: "Microsoft.App/managedEnvironments",
            }],
        }, { parent: this });

        const nsg = new azure.network.NetworkSecurityGroup(`${name}-nsg`, {
            resourceGroupName: args.resourceGroupName,
            location: args.location,
            networkSecurityGroupName: args.nsgName,
            securityRules: [{
                name: "AllowHTTPS",
                access: "Allow",
                direction: "Inbound",
                priority: 100,
                protocol: "*",
                sourceAddressPrefix: "*",
                sourcePortRange: "*",
                destinationAddressPrefix: "*",
                destinationPortRange: "443",
            }],
        }, { parent: this });


        // Asocio NSG a la Subnet
          new azure.network.SubnetNetworkSecurityGroupAssociation(`${name}-subnet-nsg`, {
            subnetId: subnet.id,
            networkSecurityGroupId: nsg.id,
        }, { parent: this }); 

        
        this.subnetId = subnet.id;

        this.registerOutputs({
            subnetId: this.subnetId,
        });
    }
}

