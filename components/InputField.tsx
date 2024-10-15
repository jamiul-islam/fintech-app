import { InputFieldProps } from "@/constants/Util";
import React from "react";
import {
  TextInput,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StyleSheet,
} from "react-native";

const InputField = ({
  label,
  icon,
  secureTextEntry = false,

  ...props
}: InputFieldProps) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.wrapper}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.inputContainer}>
            {icon && <Image source={icon} style={styles.icon} />}
            <TextInput
              style={styles.input}
              secureTextEntry={secureTextEntry}
              {...props}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
    width: "100%",
  },
  label: {
    fontSize: 18,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#f5f5f5", // neutral-100
    borderRadius: 9999, // rounded-full
    borderWidth: 1,
    borderColor: "#f5f5f5", // neutral-100
  },
  icon: {
    width: 24,
    height: 24,
    marginLeft: 16,
  },
  input: {
    borderRadius: 9999, // rounded-full
    padding: 16,
    fontWeight: "bold",
    fontSize: 15,
    flex: 1,
    textAlign: "left",
  },
});

export default InputField;
