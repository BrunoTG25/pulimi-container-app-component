import * as pulumi from "@pulumi/pulumi";
import { ContainerAppComponent } from "./component/ContainerAppComponent";
import { NetworkComponent } from "./component/NetworkComponent";
import { resourceGroup } from "./component/ResourceGroup";
import { ManagedEnvironmentComponent } from "./component/ManagedEnvironmentComponent";


const location = resourceGroup.location; // cambiar para usar location del RG creado
const resourceGroupName = resourceGroup.name; // usar el nombre del RG creado

// Crear componente de red: VNet + Subnet + NSG
const network = new NetworkComponent("my-network", {
  resourceGroupName: resourceGroupName,
  location: location,
  vnetName: "vnet-dev",
  subnetName: "subnet-dev",
  nsgName: "nsg-dev",
});

const managedEnv = new ManagedEnvironmentComponent("dev-env", {
  name: "dev-container-env",
  location: location,
  resourceGroupName: resourceGroupName,
  subnetId: network.subnetId,
});

// Crear instancia del componente reutilizable para Azure Container App
const containerApp = new ContainerAppComponent("my-app", {
  name: "my-app",
  location: location,
  resourceGroupName: resourceGroupName,
  environmentId: managedEnv.environmentId,
  image: "nginx:latest",  
  cpu: 1,                 
  memory: 2,              
  subnetId: network.subnetId,
});

export const rgName = resourceGroup.name;
export const containerAppName = containerApp.containerApp.name;
export const containerAppUrl = containerApp.containerApp.configuration.apply(
  c => c.ingress?.fqdn ?? "no ingress"
);
