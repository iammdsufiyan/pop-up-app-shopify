import { useCallback, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import {
  Modal,
  Layout,
  Card,
  Button,
  Text,
  InlineStack,
  BlockStack,
  Divider,
  Icon,
} from "@shopify/polaris";
import { XIcon } from "@shopify/polaris-icons";

interface FullScreenModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  primaryAction?: {
    content: string;
    onAction: () => void;
    loading?: boolean;
    disabled?: boolean;
  };
  secondaryActions?: Array<{
    content: string;
    onAction: () => void;
    disabled?: boolean;
  }>;
  children: React.ReactNode;
  subtitle?: string;
  breadcrumbs?: Array<{
    content: string;
    url?: string;
  }>;
}

export default function FullScreenModal({
  open,
  onClose,
  title,
  primaryAction,
  secondaryActions = [],
  children,
  subtitle,
  breadcrumbs = [],
}: FullScreenModalProps) {
  const navigate = useNavigate();

  // Handle ESC key press
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        onClose();
      }
    },
    [open, onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "var(--p-color-bg-surface)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            borderBottom: "1px solid var(--p-color-border-subdued)",
            backgroundColor: "var(--p-color-bg-surface)",
            padding: "1rem 1.5rem",
            minHeight: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ flex: 1 }}>
            <InlineStack gap="400" align="space-between">
              <BlockStack gap="100">
                {breadcrumbs.length > 0 && (
                  <InlineStack gap="200">
                    {breadcrumbs.map((breadcrumb, index) => (
                      <InlineStack key={index} gap="100" align="center">
                        {breadcrumb.url ? (
                          <Button
                            variant="plain"
                            size="micro"
                            onClick={() => navigate(breadcrumb.url!)}
                          >
                            {breadcrumb.content}
                          </Button>
                        ) : (
                          <Text as="span" variant="bodyMd" tone="subdued">
                            {breadcrumb.content}
                          </Text>
                        )}
                        {index < breadcrumbs.length - 1 && (
                          <Text as="span" variant="bodyMd" tone="subdued">
                            /
                          </Text>
                        )}
                      </InlineStack>
                    ))}
                  </InlineStack>
                )}
                <InlineStack gap="400" align="space-between">
                  <BlockStack gap="100">
                    <Text as="h1" variant="headingLg">
                      {title}
                    </Text>
                    {subtitle && (
                      <Text as="p" variant="bodyMd" tone="subdued">
                        {subtitle}
                      </Text>
                    )}
                  </BlockStack>
                  <InlineStack gap="200">
                    {secondaryActions.map((action, index) => (
                      <Button
                        key={index}
                        onClick={action.onAction}
                        disabled={action.disabled}
                      >
                        {action.content}
                      </Button>
                    ))}
                    {primaryAction && (
                      <Button
                        variant="primary"
                        onClick={primaryAction.onAction}
                        loading={primaryAction.loading}
                        disabled={primaryAction.disabled}
                      >
                        {primaryAction.content}
                      </Button>
                    )}
                    <Button
                      variant="plain"
                      onClick={onClose}
                      icon={XIcon}
                      accessibilityLabel="Close modal"
                    />
                  </InlineStack>
                </InlineStack>
              </BlockStack>
            </InlineStack>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            backgroundColor: "var(--p-color-bg-surface-secondary)",
          }}
        >
          <div style={{ padding: "1.5rem" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}