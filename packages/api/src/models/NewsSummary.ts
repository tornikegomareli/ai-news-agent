export interface NewsSummary {
  id: string;
  userId: string;
  title: string;
  content: string;
  sources: Source[];
  generatedAt: Date;
  deliveredAt?: Date;
  deliveryStatus: 'pending' | 'delivered' | 'failed';
}

export interface Source {
  url: string;
  title?: string;
  type: 'hacker_news' | 'reddit' | 'twitter' | 'github' | 'custom';
}