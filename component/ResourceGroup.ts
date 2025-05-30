
import * as azure from "@pulumi/azure-native";

export const resourceGroup = new azure.resources.ResourceGroup("mi-rg", {
    location: "EastUS",
});

