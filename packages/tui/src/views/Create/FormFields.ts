// Define form fields with validation
import { homedir } from "os";
import { join } from "path";
import type { FormField } from "../../components/Form";
const FormFields: FormField[] = [
    {
        id: "name",
        label: "Project Name",
        placeholder: "Enter project name...",
        required: true,
        validation: (value: string) => {
            if (!value?.trim()) return "Project name is required";
            if (value.length < 2) return "Project name must be at least 2 characters";
            if (!/^[a-zA-Z0-9-_ ]+$/.test(value)) {
                return "Project name can only contain letters, numbers, spaces, hyphens and underscores";
            }
            return null;
        },
    },
    {
        id: "description",
        label: "Description",
        placeholder: "A brief description of your game...",
    },
    {
        id: "author",
        label: "Author",
        placeholder: "Your name or studio...",
    },
    {
        id: "path",
        label: "Project Path",
        placeholder: "Where to create the project...",
        defaultValue: join(homedir(), "kenji-projects"),
        validation: (value: string) => {
            if (!value?.trim()) return "Project path is required";
            return null;
        },
    },
    {
        id: "platform",
        label: "Target Platform",
        placeholder: "Select target platform...",
        type: "select",
        options: ["itch.io", "standalone", "web"],
        defaultValue: "itch.io",
    },
];
export default FormFields