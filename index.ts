import * as pulumi from "@pulumi/pulumi";
import { ContainerAppComponent } from "./component/ContainerAppComponent";
import { NetworkComponent } from "./component/NetworkComponent";

// Cargar configuración del stack
const config = new pulumi.Config();

const location = config.require("azure-native:location");
const resourceGroupName = config.require("containerApp:resourceGroupName");
const environmentId = config.require("containerApp:environmentId");

// Crear componente de red: VNet + Subnet + NSG
const network = new NetworkComponent("my-network", {
  resourceGroupName: resourceGroupName,
  location: location,
  vnetName: "vnet-dev",
  subnetName: "subnet-dev",
  nsgName: "nsg-dev",
});

// Crear instancia del componente reutilizable para Azure Container App
const containerApp = new ContainerAppComponent("my-app", {
  name: "my-app",
  location: location,
  resourceGroupName: resourceGroupName,
  environmentId: environmentId,
  image: "nginx:latest",  
  cpu: 1,                 
  memory: 2,              
  subnetId: network.subnetId, //Conexión a red privada
});


export const containerAppName = containerApp.containerApp.name;
export const containerAppUrl = containerApp.containerApp.configuration.apply(
  c => c.ingress?.fqdn ?? "no ingress"
);
