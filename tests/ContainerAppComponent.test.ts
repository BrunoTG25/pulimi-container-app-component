import * as pulumi from "@pulumi/pulumi";
import * as mocks from "@pulumi/pulumi/runtime";
import { ContainerAppComponent } from "../component/ContainerAppComponent";

// Mock implementation
class MyMocks implements mocks.Mocks {
  newResource(type: string, name: string, inputs: any): { id: string, state: any } {
    return {
      id: `${name}_id`,
      state: inputs,
    };
  }
  call(args: mocks.CallArgs) {
    return args.inputs;
  }
}

// Set the mocks before running the tests
pulumi.runtime.setMocks(new MyMocks(), "project", "stack", false);

describe("ContainerAppComponent", () => {
  const baseArgs = {
    name: "testApp",
    resourceGroupName: "testRg",
    location: "westeurope",
    image: "nginx:latest",
    environmentId: "env123",
  };

  it("should create a Container App with provided settings", async () => {
    const app = new ContainerAppComponent("testApp", baseArgs);
    const name = await pulumi.output(app.containerApp.name).promise();
    const image = await pulumi.output(app.containerApp.template.containers[0].image).promise();
    const envId = await pulumi.output(app.containerApp.managedEnvironmentId).promise();
    expect(name).toBe(baseArgs.name);
    expect(image).toBe(baseArgs.image);
    expect(envId).toBe(baseArgs.environmentId);
  });

  it("should use default CPU and memory when not provided", async () => {
    const app = new ContainerAppComponent("defaultResources", baseArgs);
    const container = app.containerApp.template.containers[0];
    const cpu = await pulumi.output(container.resources.cpu).promise();
    const memory = await pulumi.output(container.resources.memory).promise();
    expect(cpu).toBe(0.5);
    expect(memory).toBe("1Gi");
  });

  it("should use custom CPU and memory when provided", async () => {
    const app = new ContainerAppComponent("customResources", {
      ...baseArgs,
      cpu: 1.0,
      memory: 2.0,
    });
    const container = app.containerApp.template.containers[0];
    const cpu = await pulumi.output(container.resources.cpu).promise();
    const memory = await pulumi.output(container.resources.memory).promise();
    expect(cpu).toBe(1.0);
    expect(memory).toBe("2Gi");
  });

  it("should configure ingress with external = true and targetPort = 80", async () => {
    const app = new ContainerAppComponent("ingressTest", baseArgs);
    const config = app.containerApp.configuration;
    const external = await pulumi.output(config.ingress.external).promise();
    const targetPort = await pulumi.output(config.ingress.targetPort).promise();
    expect(external).toBe(true);
    expect(targetPort).toBe(80);
  });

  it("should configure scaling with minReplicas = 1 and maxReplicas = 3", async () => {
    const app = new ContainerAppComponent("scaleTest", baseArgs);
    const scale = app.containerApp.template.scale;
    const minReplicas = await pulumi.output(scale.minReplicas).promise();
    const maxReplicas = await pulumi.output(scale.maxReplicas).promise();
    expect(minReplicas).toBe(1);
    expect(maxReplicas).toBe(3);
  });

  it("should register containerApp as output", async () => {
    const app = new ContainerAppComponent("outputTest", baseArgs);
    expect(app.containerApp).toBeDefined();
  });

  it("should support dynamic Pulumi inputs for cpu and memory", async () => {
    const app = new ContainerAppComponent("dynamicResources", {
      ...baseArgs,
      cpu: pulumi.output(2),
      memory: pulumi.output(4),
    });
    const container = app.containerApp.template.containers[0];
    const cpu = await pulumi.output(container.resources.cpu).promise();
    const memory = await pulumi.output(container.resources.memory).promise();
    expect(cpu).toBe(2);
    expect(memory).toBe("4Gi");
  });
});



