import React, { useRef, useState } from "react";
import {
  createStyles,
  NumberInput,
  NumberInputHandlers,
  ActionIcon,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { IconPlus, IconMinus } from "@tabler/icons";

const useStyles = createStyles((theme) => ({
  wrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `6px ${theme.spacing.xs}px`,
    borderRadius: theme.radius.sm,
    border: `1px solid ${
      theme.colorScheme === "dark" ? "transparent" : theme.colors.gray[3]
    }`,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.white,

    "&:focus-within": {
      borderColor: theme.colors[theme.primaryColor][6],
    },
  },

  control: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    border: `1px solid ${
      theme.colorScheme === "dark" ? "transparent" : theme.colors.gray[3]
    }`,

    "&:disabled": {
      borderColor:
        theme.colorScheme === "dark" ? "transparent" : theme.colors.gray[3],
      opacity: 0.8,
      backgroundColor: "transparent",
    },
  },

  input: {
    textAlign: "center",
    paddingRight: `${theme.spacing.sm}px !important`,
    paddingLeft: `${theme.spacing.sm}px !important`,
    height: 28,
    flex: 1,
  },
}));

interface QuantityInputProps {
  min?: number;
  max?: number;
  label?: string;
  defaultValue?: number;
  form?: any;
  path?: string;
  sx?: any;
  onChange?: (value: number) => void;
}

export default function QuantityInput({
  min = 0,
  max = 255,
  label = "",
  defaultValue = 1,
  form,
  path,
  sx,
  onChange,
}: QuantityInputProps) {
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const handlers = useRef<NumberInputHandlers>(null);
  const [value, setValue] = useState<number | undefined>(defaultValue);

  React.useEffect(() => {
    if (form) {
      form.setFieldValue(path, defaultValue);
    }
  }, []);

  React.useEffect(() => {
    if (form) {
      form.setFieldValue(path, value);
    }
    onChange && onChange(value);
  }, [value]);

  return (
    <React.Fragment>
      <Text
        sx={{
          fontSize: theme.fontSizes.sm,
          fontWeight: 400,
          marginTop: "0.5rem",
        }}
      >
        {label}
      </Text>

      <div className={classes.wrapper}>
        <ActionIcon<"button">
          size={28}
          variant="transparent"
          onClick={() => handlers.current?.decrement()}
          disabled={value === min}
          className={classes.control}
          onMouseDown={(event) => event.preventDefault()}
        >
          <IconMinus size={16} stroke={1.5} />
        </ActionIcon>

        <NumberInput
          variant="unstyled"
          min={min}
          max={max}
          sx={sx}
          value={value}
          handlersRef={handlers}
          onChange={setValue}
          classNames={{ input: classes.input }}
          {...form?.getInputProps(path, { type: "number" })}
        />

        <ActionIcon<"button">
          size={28}
          variant="transparent"
          disabled={value === max}
          className={classes.control}
          onClick={() => handlers.current?.increment()}
          onMouseDown={(event) => event.preventDefault()}
        >
          <IconPlus size={16} stroke={1.5} />
        </ActionIcon>
      </div>
    </React.Fragment>
  );
}
