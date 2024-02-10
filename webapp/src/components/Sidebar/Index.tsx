"use client";

import { Button, Flex, Separator, Text } from "@radix-ui/themes";
import { usePathname, useRouter } from "next/navigation";
// import { useAuth } from '../../store/useAuth'

import styles from "./page.module.css";
import {
  ExitIcon,
  FileTextIcon,
  TableIcon,
  PersonIcon,
  BoxIcon,
} from "@radix-ui/react-icons";
import { ReactNode } from "react";
import { useAuth } from "../../store/useAuth";

function SidebarButton({
  label,
  slug,
  route,
  icon,
}: {
  label: string;
  slug: string;
  route: string;
  icon: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const selected = pathname.includes(slug);
  const onClick = () => router.push(route);

  return (
    <Button
      className={styles[selected ? "button-selected" : "button"]}
      onClick={onClick}
    >
      {icon}
      {label}
    </Button>
  );
}

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <Flex direction="column" gap="2" className={styles["sidebar"]}>
      <SidebarButton
        label="Projects"
        slug="projects"
        route="/projects"
        icon={<FileTextIcon />}
      />
      {user?.type === "admin" && (
        <>
          <SidebarButton
            label="Tagsets"
            slug="tagsets"
            route="/tagsets"
            icon={<TableIcon />}
          />
          <SidebarButton
            label="Collaborators"
            slug="collaborators"
            route="/collaborators"
            icon={<PersonIcon />}
          />
          <SidebarButton
            label="Models"
            slug="models"
            route="/models"
            icon={<BoxIcon />}
          />
        </>
      )}
      <Separator />
      <Flex gap="2" align="center" mx="3" style={{ cursor: "pointer" }}>
        <ExitIcon color="#be3239" />
        <Text color="red" size="2" onClick={logout}>
          Logout
        </Text>
      </Flex>
    </Flex>
  );
}
