import {
  Card,
  Page,
  Layout,
  TextField,
  Button,
  FormLayout,
  Toast,
  Frame,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useEffect } from "react";

export default function HomePage() {
  const [announcement, setAnnouncement] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // 1. Fetch the current saved announcement on load
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await fetch("/api/announcement");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setAnnouncement(data.text || "");
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching announcement:", err);
        setIsLoading(false);
      }
    };
    fetchAnnouncement();
  }, []);

  // 2. Handle form submission (Save button)
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/announcement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: announcement }),
      });

      if (response.ok) {
        setToastMessage("Announcement saved successfully!");
        setShowToast(true);
      } else {
        throw new Error("Failed to save");
      }
    } catch (err) {
      console.error("Error saving announcement:", err);
      setToastMessage("Failed to save announcement");
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  const toastMarkup = showToast ? (
    <Toast content={toastMessage} onDismiss={() => setShowToast(false)} />
  ) : null;

  return (
    <Frame>
      <Page narrowWidth>
        <TitleBar title="Announcement Settings" />
        <Layout>
          <Layout.Section>
            <Card sectioned title="Manage Announcement Bar">
              {isLoading ? (
                <p>Loading settings...</p>
              ) : (
                <FormLayout>
                  <TextField
                    label="Announcement Text"
                    value={announcement}
                    onChange={(value) => setAnnouncement(value)}
                    multiline={4}
                    placeholder="Enter the text to display on your storefront banner..."
                    autoComplete="off"
                  />
                  <Button primary loading={isSaving} onClick={handleSave}>
                    Save Announcement
                  </Button>
                </FormLayout>
              )}
            </Card>
          </Layout.Section>
        </Layout>
        {toastMarkup}
      </Page>
    </Frame>
  );
}