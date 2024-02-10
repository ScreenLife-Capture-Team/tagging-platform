import {
  Dialog,
  Button,
  Flex,
  Text,
  Heading,
  Table,
  Checkbox,
} from "@radix-ui/themes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { app } from "../../client";

type FormData = {
  tagsetIds: number[];
};

type Props = {
  initialData: FormData & { id: string };
};

export default function EditProject(props: Props) {
  const queryClient = useQueryClient();
  const { data: tagsets } = useQuery({
    queryKey: ["tagsets"],
    queryFn: () => app.service("tagsets").find({}),
  });

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    control,
  } = useForm<FormData>({
    defaultValues: {
      tagsetIds: props.initialData?.tagsetIds || ([] as number[]),
    },
  });

  const submit = async (data: FormData) => {
    try {
      await app.service("projects").patch(props.initialData.id, {
        tagsetIds: data.tagsetIds,
      });
      alert("Collaborator edited!");
      queryClient.refetchQueries({ queryKey: ["projects"] });
      document.getElementById("close-button")?.click();
    } catch (err: any) {
      alert(err);
    }
  };

  return (
    <Flex direction="column" gap="4">
      <Dialog.Title>Edit Project</Dialog.Title>

      {/* <Flex direction="column" gap="2">
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
      </Flex> */}

      <Flex direction="column" gap="2">
        <Heading size="3">Tagsets</Heading>
        <Table.Body>
          {tagsets?.data.map((tagset) => (
            <Table.Row key={tagset.id}>
              <Table.Cell>
                <Text as="label" style={{ userSelect: "none" }} size="2">
                  <Flex gap="2" align="center">
                    <Controller
                      name="tagsetIds"
                      control={control}
                      render={({ field: { value, onChange, onBlur } }) => (
                        <Checkbox
                          checked={value.includes(tagset.id)}
                          onClick={() => {
                            const newValue = value.includes(tagset.id)
                              ? value.filter((v) => v !== tagset.id)
                              : [...value, tagset.id];
                            onChange(newValue);
                            onBlur();
                          }}
                        />
                      )}
                    />
                    {tagset.name}
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
