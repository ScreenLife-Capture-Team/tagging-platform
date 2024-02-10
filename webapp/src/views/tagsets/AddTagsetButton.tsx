import { Dialog, Button, Flex, TextField, Text } from "@radix-ui/themes";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { app } from "../../client";

export default function AddTagsetButton() {
  const queryClient = useQueryClient();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: {
      name: "",
    },
  });

  const submit = async (data: { name: string }) => {
    try {
      await app.service("tagsets").create({
        name: data.name,
      });
      alert("Tagset added!");
      queryClient.refetchQueries({ queryKey: ["tagsets"] });
      document.getElementById("close-button")?.click();
    } catch (err: any) {
      alert(err);
    }
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button variant="outline">Add Tagset</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <form onSubmit={handleSubmit(submit)}>
          <Flex direction="column" gap="2">
            <Dialog.Title>Add New Tagset</Dialog.Title>
            <Flex direction="row" align="center" gap="2">
              <Text size="2" style={{ width: 48 }}>
                Name
              </Text>
              <TextField.Input {...register("name", { required: true })} />
              {errors?.name && (
                <Text size="2" color="red">
                  {errors.name.type}
                </Text>
              )}
            </Flex>
            <Flex justify="end" gap="4" align="center">
              <Dialog.Close>
                <Button type="button" variant="ghost" id="close-button">
                  Close
                </Button>
              </Dialog.Close>
              <Button type="submit">Submit</Button>
            </Flex>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  );
}
