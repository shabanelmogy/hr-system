import LockIcon from "@mui/icons-material/Lock";
import Person2Icon from "@mui/icons-material/Person2";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

interface UseFormStepsParams {
  t: (key: string) => string;
}

export const useFormSteps = ({ t }: UseFormStepsParams) => {
  const formSteps = [
    {
      id: "personal-details",
      label: t("personalDetails"),
      icon: <Person2Icon />,
    },
    {
      id: "account-security",
      label: t("accountSecurity"),
      icon: <LockIcon />,
    },
    {
      id: "profile-picture",
      label: t("profilePicture"),
      icon: <PhotoCameraIcon />,
    },
  ];

  return {
    steps: formSteps,
  };
};
