import React from "react";
import { TextField } from "@mui/material";

export default function NumberInput(props) {
  const { onChange, ...rest } = props;

  const handleInputChange = (ev) => {
    const regex = /^(?!-0(\.0+)?$)-?(0|[1-9]\d*)(\.\d+)?$/;
    let val = ev.target.value;
    if (regex.test(val) || regex.test(`${val}0`)) {
      // accept value in format: xxx | xxx. | xxx.xx (ex: 333 | 1232. | 12.213)
      onChange(ev);
    }
  };

  return <TextField {...rest} type="text" onChange={handleInputChange} />;
}