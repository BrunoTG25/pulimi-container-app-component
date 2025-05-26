import * as pulumi from "@pulumi/pulumi";
import { NetworkComponent } from "../component/NetworkComponent";

// Mock Pulumi resources for unit testing
pulumi.runtime.setMocks({
  newResource: (args) => ({
    id: args.name + "_id",
    state: args.inputs,
  }),
  call: (args) => args,
});

describe("NetworkComponent", () => {
  const baseArgs = {
    name: "test-vnet",
    resourceGroupName: "test-rg",
    location: "westeurope",
    addressSpace: "10.0.0.0/16",
    subnetName: "subnet1",
    subnetPrefix: "10.0.1.0/24",
    // Add other required args if needed
  };

  it("should create a virtual network with correct name and address space", async () => {
    const comp = new NetworkComponent("test-vnet", baseArgs);
    expect(comp).toBeDefined();
    expect(comp.vnet).toBeDefined();
    const name = await pulumi.output(comp.vnet.name).promise();
    const addressSpace = await pulumi.output(comp.vnet.addressSpace).promise();
    expect(name).toBe(baseArgs.name);
    expect(addressSpace).toBe(baseArgs.addressSpace);
  });

  it("should create a subnet with correct name and prefix", async () => {
    const comp = new NetworkComponent("test-vnet", baseArgs);
    expect(comp.subnet).toBeDefined();
    const subnetName = await pulumi.output(comp.subnet.name).promise();
    const subnetPrefix = await pulumi.output(comp.subnet.addressPrefix).promise();
    expect(subnetName).toBe(baseArgs.subnetName);
    expect(subnetPrefix).toBe(baseArgs.subnetPrefix);
  });

  it("should register outputs", async () => {
    const comp = new NetworkComponent("test-vnet", baseArgs);
    expect(comp.vnet).toBeDefined();
    expect(comp.subnet).toBeDefined();
  });

  it("should support dynamic Pulumi inputs", async () => {
    const dynamicArgs = {
      ...baseArgs,
      resourceGroupName: pulumi.output("dynamic-rg"),
      location: pulumi.output("dynamic-location"),
    };
    const comp = new NetworkComponent("test-vnet", dynamicArgs);
    expect(comp.vnet.resourceGroupName).toBeInstanceOf(pulumi.Output);
    expect(comp.vnet.location).toBeInstanceOf(pulumi.Output);
  });

  it("should throw if required args are missing", async () => {
    // @ts-expect-error
    expect(() => new NetworkComponent("bad-vnet", {})).toThrow();
  });

  it("should create a subnet with proper delegation to Microsoft.App/managedEnvironments", async () => {
    const comp = new NetworkComponent("test-vnet", baseArgs);
    const delegations = await pulumi.output(comp.subnet.delegations).promise();
    expect(delegations).toBeDefined();
    expect(delegations.length).toBeGreaterThan(0);
    expect(delegations[0].serviceName).toBe("Microsoft.App/managedEnvironments");
  });

  it("should create a network security group with an AllowHTTPS rule", async () => {
    const comp = new NetworkComponent("test-vnet", baseArgs);
    const rules = await pulumi.output(comp.nsg.securityRules).promise();
    const httpsRule = rules.find(r => r.name === "AllowHTTPS");
    expect(httpsRule).toBeDefined();
    expect(httpsRule.access).toBe("Allow");
    expect(httpsRule.direction).toBe("Inbound");
    expect(httpsRule.destinationPortRange).toBe("443");
  });
});