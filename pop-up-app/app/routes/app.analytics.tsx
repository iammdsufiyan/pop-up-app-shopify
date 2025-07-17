import { useCallback, useState, useEffect } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  Select,
  Button,
  Box,
  Divider,
  Modal,
  DataTable,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

// Chart.js imports (will work after installation)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return json({ shop: session.shop });
};

export default function Analytics() {
  const { shop } = useLoaderData<typeof loader>();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7");
  const [showSuccessRateModal, setShowSuccessRateModal] = useState(false);

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics-data?days=${timeRange}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalyticsData(data.data);
        console.log('📊 Analytics data loaded:', data.data);
      } else {
        console.error('❌ Failed to load analytics data:', data.error);
      }
    } catch (error) {
      console.error('❌ Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Chart configurations
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Daily Performance Metrics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Conversion Funnel',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Event Distribution',
      },
    },
  };

  // Prepare chart data
  const lineChartData = analyticsData ? {
    labels: analyticsData.chartData.labels,
    datasets: [
      {
        label: 'Site Visits',
        data: analyticsData.chartData.visits,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Popup Views',
        data: analyticsData.chartData.popupViews,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Subscriptions',
        data: analyticsData.chartData.submissions,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1,
      },
    ],
  } : null;

  const barChartData = analyticsData ? {
    labels: ['Site Visits', 'Popup Views', 'Subscriptions'],
    datasets: [
      {
        label: 'Total Count',
        data: [
          analyticsData.summary.totalVisits,
          analyticsData.summary.totalPopupViews,
          analyticsData.summary.totalSubmissions,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  const doughnutData = analyticsData ? {
    labels: Object.keys(analyticsData.eventBreakdown),
    datasets: [
      {
        data: Object.values(analyticsData.eventBreakdown),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  return (
    <Page>
      <TitleBar title="Analytics Dashboard" />
      
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  Popup Performance Analytics
                </Text>
                <InlineStack gap="200">
                  <Select
                    label="Time Range"
                    options={[
                      { label: "Last 7 days", value: "7" },
                      { label: "Last 14 days", value: "14" },
                      { label: "Last 30 days", value: "30" },
                    ]}
                    value={timeRange}
                    onChange={setTimeRange}
                  />
                  <Button onClick={fetchAnalyticsData} loading={loading}>
                    Refresh
                  </Button>
                </InlineStack>
              </InlineStack>

              {loading ? (
                <Box padding="400">
                  <Text as="p" alignment="center">Loading analytics data...</Text>
                </Box>
              ) : analyticsData ? (
                <BlockStack gap="600">
                  {/* Summary Cards */}
                  <Layout>
                    <Layout.Section variant="oneHalf">
                      <Layout>
                        <Layout.Section variant="oneHalf">
                          <Card>
                            <BlockStack gap="200">
                              <Text as="h3" variant="headingMd">Total Site Visits</Text>
                              <Text as="p" variant="heading2xl">{analyticsData.summary.totalVisits}</Text>
                              <Badge>{`Unique: ${analyticsData.summary.uniqueVisitors}`}</Badge>
                            </BlockStack>
                          </Card>
                        </Layout.Section>
                        
                        <Layout.Section variant="oneHalf">
                          <Card>
                            <BlockStack gap="200">
                              <Text as="h3" variant="headingMd">Popup Views</Text>
                              <Text as="p" variant="heading2xl">{analyticsData.summary.totalPopupViews}</Text>
                              <Badge tone="warning">
                                {analyticsData.summary.totalVisits > 0
                                  ? `${Math.round((analyticsData.summary.totalPopupViews / analyticsData.summary.totalVisits) * 100)}% of visits`
                                  : '0% of visits'
                                }
                              </Badge>
                            </BlockStack>
                          </Card>
                        </Layout.Section>
                      </Layout>
                    </Layout.Section>
                    
                    <Layout.Section variant="oneHalf">
                      <Layout>
                        <Layout.Section variant="oneHalf">
                          <Card>
                            <BlockStack gap="200">
                              <Text as="h3" variant="headingMd">Subscriptions</Text>
                              <Text as="p" variant="heading2xl">{analyticsData.summary.totalSubmissions}</Text>
                              <Badge>{`${analyticsData.summary.conversionRate}% conversion rate`}</Badge>
                            </BlockStack>
                          </Card>
                        </Layout.Section>

                        <Layout.Section variant="oneHalf">
                          <Card>
                            <BlockStack gap="200">
                              <InlineStack align="space-between">
                                <Text as="h3" variant="headingMd">Success Rate</Text>
                                <Button
                                  variant="plain"
                                  size="micro"
                                  onClick={() => setShowSuccessRateModal(true)}
                                >
                                  View Details
                                </Button>
                              </InlineStack>
                              <Text as="p" variant="heading2xl">{analyticsData.summary.successRate}%</Text>
                              <Badge tone="success">
                                {analyticsData.summary.totalPopupViews > 0
                                  ? `${analyticsData.summary.totalSubmissions} of ${analyticsData.summary.totalPopupViews} views`
                                  : 'No data yet'
                                }
                              </Badge>
                            </BlockStack>
                          </Card>
                        </Layout.Section>
                      </Layout>
                    </Layout.Section>
                  </Layout>

                  <Divider />

                  {/* Charts */}
                  <Layout>
                    <Layout.Section>
                      <Card>
                        <BlockStack gap="400">
                          <Text as="h3" variant="headingMd">Daily Trends</Text>
                          {lineChartData && (
                            <Box minHeight="400px">
                              <Line data={lineChartData} options={lineChartOptions} />
                            </Box>
                          )}
                        </BlockStack>
                      </Card>
                    </Layout.Section>
                    
                    <Layout.Section variant="oneThird">
                      <Card>
                        <BlockStack gap="400">
                          <Text as="h3" variant="headingMd">Event Distribution</Text>
                          {doughnutData && (
                            <Box minHeight="300px">
                              <Doughnut data={doughnutData} options={doughnutOptions} />
                            </Box>
                          )}
                        </BlockStack>
                      </Card>
                    </Layout.Section>
                  </Layout>

                  <Card>
                    <BlockStack gap="400">
                      <Text as="h3" variant="headingMd">Conversion Funnel</Text>
                      {barChartData && (
                        <Box minHeight="400px">
                          <Bar data={barChartData} options={barChartOptions} />
                        </Box>
                      )}
                    </BlockStack>
                  </Card>
                </BlockStack>
              ) : (
                <Box padding="400">
                  <Text as="p" alignment="center">No analytics data available yet. Visit your store to start collecting data!</Text>
                </Box>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      {/* Success Rate Details Modal */}
      <Modal
        open={showSuccessRateModal}
        onClose={() => setShowSuccessRateModal(false)}
        title="Success Rate Details"
        primaryAction={{
          content: 'Close',
          onAction: () => setShowSuccessRateModal(false),
        }}
      >
        <Modal.Section>
          {analyticsData?.subscriptionDetails ? (
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingMd">Overview</Text>
                  <InlineStack gap="400">
                    <Box>
                      <Text as="p" variant="bodyMd" tone="subdued">Total Subscriptions</Text>
                      <Text as="p" variant="headingLg">{analyticsData.subscriptionDetails.totalSubscriptions}</Text>
                    </Box>
                    <Box>
                      <Text as="p" variant="bodyMd" tone="subdued">Success Rate</Text>
                      <Text as="p" variant="headingLg">{analyticsData.subscriptionDetails.successRate}%</Text>
                    </Box>
                    <Box>
                      <Text as="p" variant="bodyMd" tone="subdued">Total Popup Views</Text>
                      <Text as="p" variant="headingLg">{analyticsData.summary.totalPopupViews}</Text>
                    </Box>
                  </InlineStack>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h3" variant="headingMd">Daily Breakdown</Text>
                  <DataTable
                    columnContentTypes={['text', 'numeric', 'numeric', 'numeric']}
                    headings={['Date', 'Subscriptions', 'Popup Views', 'Success Rate']}
                    rows={analyticsData.subscriptionDetails.dailyBreakdown.map((day: any) => [
                      day.date,
                      day.subscriptions,
                      day.views,
                      `${Math.round(day.successRate * 100) / 100}%`
                    ])}
                  />
                </BlockStack>
              </Card>

              {analyticsData.subscriptionDetails.recentSubscriptions.length > 0 && (
                <Card>
                  <BlockStack gap="300">
                    <Text as="h3" variant="headingMd">Recent Subscriptions</Text>
                    <DataTable
                      columnContentTypes={['text', 'text', 'text']}
                      headings={['Timestamp', 'Session ID', 'Page URL']}
                      rows={analyticsData.subscriptionDetails.recentSubscriptions.map((sub: any) => [
                        new Date(sub.timestamp).toLocaleString(),
                        sub.sessionId?.substring(0, 8) + '...' || 'N/A',
                        sub.pageUrl || 'N/A'
                      ])}
                    />
                  </BlockStack>
                </Card>
              )}
            </BlockStack>
          ) : (
            <Box padding="400">
              <Text as="p" alignment="center">No subscription data available yet.</Text>
            </Box>
          )}
        </Modal.Section>
      </Modal>
    </Page>
  );
}