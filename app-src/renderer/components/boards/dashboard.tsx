import React, { useEffect, useRef, useState } from "react";
import {
  Badge,
  Box,
  createStyles,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Text,
} from "@mantine/core";
import {
  IconUserPlus,
  IconDiscount2,
  IconReceipt2,
  IconBolt,
  IconArrowUpRight,
  IconArrowDownRight,
  IconPackage,
} from "@tabler/icons";
import { randomId, useHash, useInterval } from "@mantine/hooks";
import { ipcRenderer } from "electron";

const useStyles = createStyles((theme) => ({
  root: {
    padding: theme.spacing.xl * 1.5,
  },

  value: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1,
  },

  diff: {
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
  },

  icon: {
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[3]
        : theme.colors.gray[4],
  },

  title: {
    fontWeight: 700,
    textTransform: "uppercase",
  },
}));

const icons = {
  user: IconUserPlus,
  discount: IconDiscount2,
  package: IconPackage,
  bolt: IconBolt,
};

interface StatsGridProps {
  data: {
    title: string;
    icon: keyof typeof icons;
    value: number;
    diff: number;
  }[];
}

export function StatsGrid({ data }: StatsGridProps) {
  const { classes } = useStyles();
  const stats = data.map((stat) => {
    const Icon = icons[stat.icon];
    const DiffIcon = stat.diff > 0 ? IconArrowUpRight : IconArrowDownRight;

    return (
      <Paper withBorder p="md" radius="md" key={stat.title}>
        <Group position="apart">
          <Text size="xs" color="dimmed" className={classes.title}>
            {stat.title}
          </Text>
          <Icon className={classes.icon} size={22} stroke={1.5} />
        </Group>

        <Group align="flex-end" spacing="xs" mt={25}>
          <Text className={classes.value}>
            {stat.value.toFixed(2)}
            {stat.icon === "bolt" ? "W" : "%"}
          </Text>
          <Text
            color={stat.diff > 0 ? "red" : "teal"}
            size="sm"
            weight={500}
            className={classes.diff}
          >
            {<span>{stat.diff.toFixed(2)}%</span>}
            <DiffIcon size={16} stroke={1.5} />
          </Text>
        </Group>

        <Text size="xs" color="dimmed" mt={7}>
          {stat.icon === "bolt"
            ? "actual Power consumtion"
            : "packageloss over lifetime"}
        </Text>
      </Paper>
    );
  });
  return (
    <div className={classes.root}>
      <SimpleGrid cols={2}>{stats}</SimpleGrid>
    </div>
  );
}

interface DashboardProps {}

export default function Dashboard({}: DashboardProps) {
  const [hash, setHash] = useHash();
  const dashBoardData = useRef<{ details: any; title: string; task: string }[]>(
    []
  );

  const interval = useInterval(() => {
    ipcRenderer.invoke("GET_STATS").then((dashboardData) => {
      dashBoardData.current = dashboardData;
      setHash(randomId());
    });
  }, 3000);

  useEffect(() => {
    interval.start();
    return interval.stop;
  }, []);

  return (
    <Box key={hash}>
      {dashBoardData.current.map((item) => (
        <Box key={item.title}>
          <Group position="apart">
            <Text size="xl" mt={4} mb={1} weight={900}>
              {item.title}:
            </Text>
            <Badge color={item.task ? "lime" : "grape"} size="sm">
              {item.task || "nothing to do"}
            </Badge>
          </Group>
          <StatsGrid data={item.details} />
        </Box>
      ))}
      {dashBoardData.current.length === 0 && (
        <Box>
          <Group position="apart" m={9}>
            <Skeleton height={20} mt={8} width="25%" radius="xl" />
            <Skeleton height={20} mt={8} width="5%" radius="xl" />
          </Group>
          <Group position="center" m={9} mt={15}>
            <Skeleton height={130} mt={8} width="40%" radius="md" />
            <Skeleton height={130} mt={8} width="40%" radius="md" />
          </Group>
        </Box>
      )}
    </Box>
  );
}
