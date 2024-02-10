import { Badge, Box, Flex, Kbd, Text } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { app } from "../client";
import { useEffect } from "react";

function invertHex(hex: string) {
  return (
    "#" +
    (Number(`0x1${hex.replace("#", "")}`) ^ 0xffffff)
      .toString(16)
      .substr(1)
      .toUpperCase()
  );
}

function getColorByBgColor(bgColor: string) {
  if (!bgColor) {
    return "";
  }
  return parseInt(bgColor.replace("#", ""), 16) > 0xffffff / 2
    ? "#000"
    : "#fff";
}

export function Tag({ tagId }: { tagId: number }) {
  const { data } = useQuery({
    queryKey: ["tags", tagId],
    queryFn: () => app.service("tags").get(tagId),
    refetchOnWindowFocus: false,
    gcTime: 1000 * 60,
    staleTime: 1000 * 60,
  });

  return (
    <Flex
      key={tagId}
      px="2"
      style={{
        backgroundColor: data?.color || "black",
        borderRadius: 180,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p
        style={{
          color: data?.color ? getColorByBgColor(data.color) : "white",
          fontSize: 12,
        }}
      >
        {data?.name || "Missing"}
      </p>
    </Flex>
  );
}
