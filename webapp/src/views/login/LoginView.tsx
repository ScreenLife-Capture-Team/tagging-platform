"use client";
import {
  Button,
  Container,
  Flex,
  Heading,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useForm } from "react-hook-form";
import { useAuth } from "../../store/useAuth";
import { useRouter } from "next/navigation";

type FormData = {
  email: string;
  password: string;
};

export default function LoginView() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { login } = useAuth();
  const router = useRouter();

  const submit = async (data: FormData) => {
    try {
      await login({ username: data.email, password: data.password });
      router.push("/projects");
    } catch (err: any) {
      alert(err?.message || JSON.stringify(err));
    }
  };

  return (
    <Container
      p="4"
      style={{
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Flex
        direction="column"
        gap="6"
        align="center"
        justify="center"
        height="100%"
      >
        <Flex align="center" justify="between" direction="column" mb="4" mx="8">
          <Heading size="9" align="center">
            ScreenLife Capture Tagging Platform
          </Heading>
        </Flex>

        <Flex direction="column" gap="2">
          <Flex direction="column" gap="1">
            <TextField.Root>
              <TextField.Input
                size="3"
                style={{ width: 240 }}
                {...register("email")}
                placeholder="Email"
              />
            </TextField.Root>
          </Flex>

          <Flex direction="column" gap="1">
            <TextField.Root>
              <TextField.Input
                size="3"
                style={{ width: 240 }}
                {...register("password")}
                type="password"
                placeholder="Password"
              />
            </TextField.Root>
          </Flex>

          <Button onClick={handleSubmit(submit)}>Login</Button>
        </Flex>
      </Flex>
    </Container>
  );
}
