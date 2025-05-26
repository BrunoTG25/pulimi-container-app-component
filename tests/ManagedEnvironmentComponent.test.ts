import * as pulumi from "@pulumi/pulumi";
import { ManagedEnvironmentComponent } from "../component/ManagedEnvironmentComponent";

// Mock Pulumi resources for unit testing
pulumi.runtime.setMocks({
  newResource: (args) => ({
    id: args.name + "_id",
    state: args.inputs,
  }),
  call: (args) => args,
});

describe("ManagedEnvironmentComponent", () => {
  const baseArgs = {
    name: "test-env",
    resourceGroupName: "test-rg",
    location: "westeurope",
    // Add other required args if needed
  };

  it("should create a managed environment with correct name", async () => {
    const comp = new ManagedEnvironmentComponent("test-env", baseArgs);
    expect(comp).toBeDefined();
    expect(comp.environment).toBeDefined();
    const name = await pulumi.output(comp.environment.name).promise();
    expect(name).toBe(baseArgs.name);
  });

  it("should use the correct resource group and location", async () => {
    const comp = new ManagedEnvironmentComponent("test-env", baseArgs);
    const rg = await pulumi.output(comp.environment.resourceGroupName).promise();
    const loc = await pulumi.output(comp.environment.location).promise();
    expect(rg).toBe(baseArgs.resourceGroupName);
    expect(loc).toBe(baseArgs.location);
  });

  it("should register outputs", async () => {
    const comp = new ManagedEnvironmentComponent("test-env", baseArgs);
    expect(comp.environment).toBeDefined();
  });

  it("should allow custom tags", async () => {
    const comp = new ManagedEnvironmentComponent("test-env", {
      ...baseArgs,
      tags: { env: "dev", owner: "test" },
    });
    const tags = await pulumi.output(comp.environment.tags).promise();
    expect(tags).toEqual({ env: "dev", owner: "test" });
  });

  it("should throw if required args are missing", async () => {
    // @ts-expect-error
    expect(() => new ManagedEnvironmentComponent("bad-env", {})).toThrow();
  });

  it("should support dynamic Pulumi inputs", async () => {
    const dynamicArgs = {
      ...baseArgs,
      resourceGroupName: pulumi.output("dynamic-rg"),
      location: pulumi.output("dynamic-location"),
    };
    const comp = new ManagedEnvironmentComponent("test-env", dynamicArgs);
    expect(comp.environment.resourceGroupName).toBeInstanceOf(pulumi.Output);
    expect(comp.environment.location).toBeInstanceOf(pulumi.Output);
  });
});