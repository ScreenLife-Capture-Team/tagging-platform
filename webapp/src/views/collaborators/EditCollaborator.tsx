import {
  Dialog,
  Button,
  Flex,
  TextField,
  Text,
  Heading,
  Table,
  Checkbox,
} from "@radix-ui/themes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { app } from "../../client";
import { nanoid } from "nanoid";

type FormData = {
  email: string;
  password?: string;
  projectIds: string[];
};

type Props = {
  initialData?: FormData & { id: number };
};

export default function EditCollaborator(props: Props) {
  const queryClient = useQueryClient();
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => app.service("projects").find({}),
  });

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    control,
  } = useForm<FormData>({
    defaultValues: {
      email: props.initialData?.email || "",
      password: "",
      projectIds: props.initialData?.projectIds || [],
    },
  });

  const submit = async (data: FormData) => {
    try {
      if (props.initialData?.id) {
        await app.service("users").patch(props.initialData?.id, {
          email: data.email,
          password: data.password || undefined,
          projectIds: data.projectIds,
        });
        alert("Collaborator edited!");
      } else {
        await app.service("users").create({
          email: data.email,
          password: data.password,
          type: "collaborator",
        });
        alert("Collaborator added!");
      }
      queryClient.refetchQueries({ queryKey: ["collaborators"] });
      document.getElementById("close-button")?.click();
    } catch (err: any) {
      alert(err);
    }
  };

  const generatePassword = () => {
    setValue("password", nanoid());
  };

  return (
    <Flex direction="column" gap="4">
      <Dialog.Title>Add New Collaborator</Dialog.Title>

      <Flex direction="column" gap="2">
        <Heading size="3">Basic Information</Heading>
        <Flex direction="row" align="center" gap="2">
          <Text size="2" style={{ width: 80 }}>
            Email
          </Text>
          <TextField.Input
            {...register("email", { required: true })}
            style={{ width: 240 }}
          />
          {errors?.email && (
            <Text size="2" color="red">
              {errors.email.type}
            </Text>
          )}
        </Flex>

        <Flex direction="row" align="center" gap="2">
          <Text size="2" style={{ width: 80 }}>
            Password
          </Text>
          <TextField.Root>
            <TextField.Input {...register("password")} style={{ width: 240 }} />
            <TextField.Slot>
              <Button size="1" variant="ghost" onClick={generatePassword}>
                Generate
              </Button>
            </TextField.Slot>
          </TextField.Root>
          {errors?.password && (
            <Text size="2" color="red">
              {errors.password.type}
            </Text>
          )}
        </Flex>
      </Flex>

      <Flex direction="column" gap="2">
        <Heading size="3">Project Access</Heading>
        <Table.Body>
          {projects?.data.map((project) => (
            <Table.Row key={project.id}>
              <Table.Cell>
                <Text as="label" style={{ userSelect: "none" }} size="2">
                  <Flex gap="2" align="center">
                    <Controller
                      name="projectIds"
                      control={control}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <Checkbox
                          checked={value.includes(project.id)}
                          onClick={() => {
                            const newValue = value.includes(project.id)
                              ? value.filter((v) => v !== project.id)
                              : [...value, project.id];
                            onChange(newValue);
                            onBlur();
                          }}
                        />
                      )}
                    />
                    {project.id}
                  </Flex>
                </Text>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Flex>

      <Flex justify="end" gap="4" align="center">
        <Dialog.Close>
          <Button type="button" variant="ghost" id="close-button">
            Close
          </Button>
        </Dialog.Close>
        <Button onClick={handleSubmit(submit)}>Submit</Button>
      </Flex>
    </Flex>
  );
}
