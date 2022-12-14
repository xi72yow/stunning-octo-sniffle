import {
  Group,
  ActionIcon,
  useMantineColorScheme,
  useMantineTheme,
  Tooltip,
  Menu,
  Button,
  Dialog,
  Text,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  IconSun,
  IconMoonStars,
  IconPower,
  IconPlayerPlay,
  IconHelp,
  IconArrowsLeftRight,
  IconMessageCircle,
  IconPhoto,
  IconSearch,
  IconSettings,
  IconTrash,
  IconFileDownload,
} from "@tabler/icons";
import { useLiveQuery } from "dexie-react-hooks";
import { ipcRenderer } from "electron";
import React, { useState } from "react";
import { db } from "../database/db";
import { useConfirm } from "../hooks/confirm";
import HelpModal from "../modale/helpModal";

type Props = { setLightsOff: any; lightsOff: boolean };

export default function GlobalSettings({ setLightsOff, lightsOff }: Props) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const [open, setOpen] = useState(false);

  const confirm = useConfirm();

  const [openConfirm, setOpenConfirm] = useState(false);

  const configs = useLiveQuery(
    async () => {
      return await db.configs.toArray();
    },
    null,
    []
  );

  return (
    <Group position="center" my="xl" sx={{ paddingLeft: theme.spacing.md }}>
      <HelpModal open={open} setOpen={setOpen}></HelpModal>
      <Tooltip label={lightsOff ? "Lights On" : "Lights Off"}>
        <ActionIcon
          onClick={() => {
            setLightsOff((bool) => {
              return !bool;
            });
            if (lightsOff)
              showNotification({
                title: "Chaser Notification",
                message: "The Chasers continues to work.",
                color: "green",
                icon: <IconPlayerPlay size={18} />,
                sx: { cursor: "pointer" },
              });
            else
              showNotification({
                title: "Chaser Notification",
                message: "Signal to turn off the device has been sent. ",
                color: "red",
                icon: <IconPower size={18} />,
                sx: { cursor: "pointer" },
              });
          }}
          size="lg"
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === "dark"
                ? theme.colors.dark[6]
                : theme.colors.gray[0],
            color: lightsOff ? theme.colors.green[5] : theme.colors.red[5],
          })}
        >
          {lightsOff ? <IconPlayerPlay size={18} /> : <IconPower size={18} />}
        </ActionIcon>
      </Tooltip>
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Tooltip label="Settings">
            <ActionIcon
              size="lg"
              sx={(theme) => ({
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
                color:
                  theme.colorScheme === "dark"
                    ? theme.colors.gray[3]
                    : theme.colors.gray[9],
              })}
            >
              <IconSettings size={18} />
            </ActionIcon>
          </Tooltip>
        </Menu.Target>

        <Menu.Dropdown
          ml={8}
          sx={{
            backgroundColor:
              colorScheme === "dark"
                ? theme.colors.dark[5]
                : theme.colors.gray[2],
          }}
        >
          <Menu.Label>Application</Menu.Label>
          <Menu.Item
            icon={
              colorScheme === "dark" ? (
                <IconSun size={18} />
              ) : (
                <IconMoonStars size={18} />
              )
            }
            color={
              theme.colorScheme === "dark"
                ? theme.colors.yellow[4]
                : theme.colors.blue[6]
            }
            onClick={() => toggleColorScheme()}
          >
            Toggle Theme
          </Menu.Item>
          <Menu.Item
            icon={<IconFileDownload size={18} />}
            onClick={() => {
              ipcRenderer.invoke("APP:SAVE_CONFIG", configs).then((res) => {
                showNotification({
                  title: "Chaser Notification",
                  message: "Configuration has been " + res + ".",
                });
              });
            }}
          >
            Save Configuration
          </Menu.Item>
          <Menu.Item
            icon={<IconHelp size={18} />}
            onClick={() => {
              setOpen(true);
            }}
          >
            FAQ
          </Menu.Item>
          <Menu.Divider />
          <Menu.Label>Danger zone</Menu.Label>
          <Menu.Item
            color="red"
            icon={<IconTrash size={18} />}
            onClick={() => {
              confirm
                .showConfirmation(
                  "Are you sure you want to delete all configurations?",
                  true
                )
                .then((res) => {
                  if (res) {
                    db.delete();
                    location.reload();
                    setOpenConfirm(false);
                  }
                });
            }}
          >
            Delete Configurations
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
