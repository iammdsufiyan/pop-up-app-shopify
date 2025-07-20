import { useCallback, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import {
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

interface SlideUpModalProps {
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

export default function SlideUpModal({
  open,
  onClose,
  title,
  primaryAction,
  secondaryActions = [],
  children,
  subtitle,
  breadcrumbs = [],
}: SlideUpModalProps) {
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
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 999,
          opacity: open ? 1 : 0,
          transition: "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          backgroundColor: "var(--p-color-bg-surface)",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
      {/* Header Bar */}
      <div
        style={{
          borderBottom: "1px solid var(--p-color-border-subdued)",
          backgroundColor: "var(--p-color-bg-surface)",
          padding: "1rem 1.5rem",
          minHeight: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
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

      {/* Content Area */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          backgroundColor: "var(--p-color-bg-surface-secondary)",
          padding: "1.5rem",
        }}
      >
        {children}
      </div>
      </div>
    </>
  );
}