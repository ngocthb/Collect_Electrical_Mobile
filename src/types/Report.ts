export interface Report {
  reportId: string;
  reportUserName: string;
  reportRouteId: string;
  reportDescription: string;
  reportType: string;
  answerMessage: string | null;
  resolvedAt: string | null;
  createdAt: string;
  reportUserId: string;
  companyName: string | null;
  smallCollectionPointName: string | null;
  status: string;
  reportImages?: string[];
}
