import { TextInputProps, StyleProp } from "react-native";

export enum SignInType {
  Phone,
  Email,
  Google,
  Apple,
}

export interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: any;
  secureTextEntry?: boolean;
}
