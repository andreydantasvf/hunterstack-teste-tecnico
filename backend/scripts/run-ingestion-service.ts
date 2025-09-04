import { IngestionService } from '@/modules/ingestion/ingestion.service';

function runIngestionService() {
  const ingestionService = new IngestionService();

  const urls = [
    'https://policies.google.com/privacy',
    'https://www.facebook.com/privacy/policy',
    'https://www.microsoft.com/privacy/privacystatement',
    'https://www.apple.com/privacy/privacy-policy',
    'https://www.amazon.com/gp/help/customer/display.html?nodeId=468496'
  ];

  for (const url of urls) {
    ingestionService
      .ingestPolicyFromUrl(url)
      .then((result) => {
        console.log(`Ingestão bem-sucedida para ${url}:`, result);
      })
      .catch((error) => {
        console.error(`Erro na ingestão de ${url}:`, error);
      });
  }
}

runIngestionService();
