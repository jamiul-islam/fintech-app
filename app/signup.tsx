import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Image,
} from "react-native";
import React, { useState } from "react";
import { defaultStyles } from "@/constants/Styles";
import Colors from "@/constants/Colors";
import { Link, useRouter } from "expo-router";
import { isClerkAPIResponseError, useSignUp, useAuth } from "@clerk/clerk-expo";
import ReactNativeModal from "react-native-modal";
import InputField from "@/components/InputField";
import { SignInType } from "@/constants/Util";

const Page = () => {
  const keyboardVerticalOffset = Platform.OS === "ios" ? 80 : 0;

  const [countryCode, setCountryCode] = useState("+44");
  const [phoneNumber, setPhoneNumber] = useState("");

  const { isLoaded, setActive, signUp } = useSignUp();
  const { signOut } = useAuth();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const router = useRouter();

  const onSignUp = async (type: SignInType) => {
    if (type === SignInType.Phone) {
      const fullPhoneNumber = `${countryCode}${phoneNumber}`;

      try {
        await signUp!.create({
          phoneNumber: fullPhoneNumber,
        });

        router.push({
          pathname: "/verify/[phone]",
          params: { phone: fullPhoneNumber },
        });

        signUp!.preparePhoneNumberVerification();
      } catch (err) {
        if (isClerkAPIResponseError(err)) {
          Alert.alert("Error", err.errors[0].message);
        }
      }
    } else if (type === SignInType.Email) {
      if (!isLoaded) {
        return;
      }

      try {
        // First, try to sign out any existing session
        await signOut();

        // Then proceed with the sign-up process
        await signUp.create({
          emailAddress: form.email,
          password: form.password,
        });

        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });

        setVerification({
          ...verification,
          state: "pending",
        });
      } catch (err: any) {
        if (isClerkAPIResponseError(err)) {
          Alert.alert("Error", err.errors[0].message);
        }
      }
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        setVerification({
          ...verification,
          state: "success",
        });
      } else {
        setVerification({
          ...verification,
          error: "Verification failed. Please try again.",
          state: "failed",
        });
      }
    } catch (err: any) {
      setVerification({
        ...verification,
        error: err.errors[0].longMessage,
        state: "failed",
      });

      if (isClerkAPIResponseError(err)) {
        Alert.alert("Error", err.errors[0].message);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <View style={defaultStyles.container}>
        <Text style={defaultStyles.header}>Let's get started!</Text>
        <Text style={defaultStyles.descriptionText}>
          Enter your phone number. We will send you a confirmation code there
        </Text>

        {/* MOBILE input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Country code"
            placeholderTextColor={Colors.gray}
            value={countryCode}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Mobile number"
            placeholderTextColor={Colors.gray}
            keyboardType="numeric"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        {/* --------- or --------- */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View
            style={{
              flex: 1,
              height: StyleSheet.hairlineWidth,
              backgroundColor: Colors.gray,
            }}
          />
          <Text style={{ color: Colors.gray, fontSize: 20 }}>or</Text>
          <View
            style={{
              flex: 1,
              height: StyleSheet.hairlineWidth,
              backgroundColor: Colors.gray,
            }}
          />
        </View>

        {/* EMAIL input */}
        <View>
          <TextInput
            style={[styles.input, { marginTop: 15 }]}
            placeholder="Email"
            textContentType="emailAddress"
            onChangeText={(text) => setForm({ ...form, email: text })}
            placeholderTextColor={Colors.gray}
          />
          <TextInput
            style={[styles.input, { marginTop: 15 }]}
            placeholder="password"
            textContentType="password"
            onChangeText={(text) => setForm({ ...form, password: text })}
            placeholderTextColor={Colors.gray}
            secureTextEntry={true}
          />
        </View>

        {/* already have an account?  */}
        <Link href={"/login"} replace asChild style={{ marginTop: 15 }}>
          <TouchableOpacity>
            <Text style={defaultStyles.textLink}>
              Already have an account? Log in
            </Text>
          </TouchableOpacity>
        </Link>

        <View style={{ flex: 1 }} />

        {/* sign up button */}
        <TouchableOpacity
          style={[
            defaultStyles.pillButton,
            phoneNumber !== "" || form.email !== ""
              ? styles.enabled
              : styles.disabled,
            { marginBottom: 20 },
          ]}
          onPress={() => onSignUp(SignInType.Email)}
        >
          <Text style={defaultStyles.buttonText}>Sign up</Text>
        </TouchableOpacity>

        {/* Modal Verification */}

        <ReactNativeModal
          isVisible={verification.state === "pending"}
          onModalHide={() => {
            if (verification.state === "success") {
              setShowSuccessModal(true);
            }
          }}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Verification</Text>
            <Text style={styles.modalDescription}>
              We've sent a verification code to {form.email}.
            </Text>
            <InputField
              label={"Code"}
              icon={require("@/assets/images/lock.png")}
              placeholder={"12345"}
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({ ...verification, code })
              }
            />
            {verification.error && (
              <Text style={styles.errorText}>{verification.error}</Text>
            )}
            <TouchableOpacity
              style={[
                defaultStyles.pillButton,
                form.email !== "" ? styles.enabled : styles.disabled,
                { marginTop: 10 },
              ]}
              onPress={onPressVerify}
            >
              <Text style={defaultStyles.buttonText}>Verify Email</Text>
            </TouchableOpacity>
          </View>
        </ReactNativeModal>

        <ReactNativeModal isVisible={showSuccessModal}>
          <View style={styles.modalContainer}>
            <Image
              source={require("@/assets/images/check.png")}
              style={styles.successImage}
            />
            <Text style={styles.successTitle}>Verified</Text>
            <Text style={styles.successDescription}>
              You have successfully verified your account.
            </Text>
            <TouchableOpacity
              style={[
                defaultStyles.pillButton,
                { marginTop: 10 },
                styles.enabled,
              ]}
              onPress={() => {
                setShowSuccessModal(false);
                router.replace(`/(authenticated)/(tabs)/home`);
              }}
            >
              <Text style={defaultStyles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ReactNativeModal>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 15,
    flexDirection: "row",
  },
  input: {
    backgroundColor: Colors.lightGray,
    padding: 20,
    borderRadius: 16,
    fontSize: 20,
    marginRight: 10,
  },
  enabled: {
    backgroundColor: Colors.primary,
  },
  disabled: {
    backgroundColor: Colors.primaryMuted,
  },

  // styles of modal

  modalContainer: {
    backgroundColor: "white",
    paddingHorizontal: 28,
    paddingVertical: 36,
    borderRadius: 16,
    minHeight: 300,
  },
  modalTitle: {
    fontFamily: "JakartaExtraBold",
    fontSize: 24,
    marginBottom: 8,
  },
  modalDescription: {
    fontFamily: "Jakarta",
    marginBottom: 20,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 4,
  },
  verifyButton: {
    marginTop: 20,
    backgroundColor: Colors.success,
  },
  successImage: {
    width: 110,
    height: 110,
    alignSelf: "center",
    marginVertical: 20,
  },
  successTitle: {
    fontSize: 30,
    fontFamily: "JakartaBold",
    textAlign: "center",
  },
  successDescription: {
    fontSize: 16,
    color: "gray",
    fontFamily: "Jakarta",
    textAlign: "center",
    marginTop: 8,
  },
  browseHomeButton: {
    marginTop: 20,
  },
});

export default Page;
