/**
 * Cyfrin Solodit API Client
 * Search for security findings to improve smart contract security
 */

const API_KEY = process.env.CYFRIN_API_KEY || 'sk_0486690c20c135c9a01064c3001d793bf201315e79178ba9ebdfeb19069132b5';
const BASE_URL = 'https://solodit.cyfrin.io/api/v1/solodit';

interface Finding {
  id: string;
  title: string;
  content: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW' | 'GAS';
  quality_score: number;
  general_score: number;
  firm_name: string | null;
  protocol_name: string | null;
  source_link: string | null;
  issues_issuetagscore: Array<{
    tags_tag: {
      title: string;
    };
  }>;
}

interface SearchFilters {
  keywords?: string;
  impact?: Array<'HIGH' | 'MEDIUM' | 'LOW' | 'GAS'>;
  firms?: Array<{ value: string }>;
  tags?: Array<{ value: string }>;
  languages?: Array<{ value: string }>;
  qualityScore?: number;
  sortField?: 'Recency' | 'Quality' | 'Rarity';
  sortDirection?: 'Desc' | 'Asc';
}

async function searchFindings(
  filters: SearchFilters = {},
  page: number = 1,
  pageSize: number = 50
) {
  const response = await fetch(`${BASE_URL}/findings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Cyfrin-API-Key': API_KEY,
    },
    body: JSON.stringify({
      page,
      pageSize,
      filters,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

async function findRelevantVulnerabilities() {
  console.log('🔍 Searching for relevant security findings...\n');

  const searchTerms = [
    { keywords: 'ERC20 token', description: 'ERC20 Token Issues' },
    { keywords: 'betting gaming', description: 'Betting/Gaming Contracts' },
    { keywords: 'staking rewards', description: 'Staking Mechanisms' },
    { keywords: 'oracle manipulation', description: 'Oracle Security' },
    { keywords: 'reentrancy', description: 'Reentrancy Attacks' },
    { keywords: 'access control', description: 'Access Control Issues' },
    { keywords: 'integer overflow', description: 'Arithmetic Issues' },
    { keywords: 'front-running', description: 'MEV/Front-running' },
  ];

  const allFindings: Finding[] = [];

  for (const term of searchTerms) {
    console.log(`📖 Searching: ${term.description}...`);
    
    try {
      const data = await searchFindings(
        {
          keywords: term.keywords,
          impact: ['HIGH', 'MEDIUM'],
          languages: [{ value: 'Solidity' }],
          qualityScore: 3,
          sortField: 'Quality',
          sortDirection: 'Desc',
        },
        1,
        10
      );

      console.log(`   Found ${data.findings.length} findings`);
      allFindings.push(...data.findings);
      
      // Respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 3500));
    } catch (error) {
      console.error(`   Error: ${error.message}`);
    }
  }

  return allFindings;
}

async function generateSecurityReport() {
  console.log('════════════════════════════════════════════════════════════');
  console.log('         🛡️  CLASH OF CLANKS SECURITY AUDIT 🛡️');
  console.log('               Powered by Cyfrin Solodit');
  console.log('════════════════════════════════════════════════════════════\n');

  const findings = await findRelevantVulnerabilities();

  console.log(`\n📊 Total Findings Retrieved: ${findings.length}\n`);

  // Group by impact
  const byImpact = {
    HIGH: findings.filter((f) => f.impact === 'HIGH'),
    MEDIUM: findings.filter((f) => f.impact === 'MEDIUM'),
    LOW: findings.filter((f) => f.impact === 'LOW'),
  };

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📈 FINDINGS BY SEVERITY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🔴 HIGH:     ${byImpact.HIGH.length} findings`);
  console.log(`🟡 MEDIUM:   ${byImpact.MEDIUM.length} findings`);
  console.log(`🟢 LOW:      ${byImpact.LOW.length} findings\n`);

  // Show top HIGH severity findings
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔴 TOP HIGH SEVERITY FINDINGS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  byImpact.HIGH.slice(0, 10).forEach((finding, i) => {
    const tags = finding.issues_issuetagscore
      .map((t) => t.tags_tag.title)
      .join(', ');
    
    console.log(`${i + 1}. ${finding.title}`);
    console.log(`   Quality: ${finding.quality_score}/5 | Firm: ${finding.firm_name || 'N/A'}`);
    console.log(`   Tags: ${tags || 'None'}`);
    if (finding.source_link) {
      console.log(`   🔗 ${finding.source_link}`);
    }
    console.log('');
  });

  // Common vulnerability patterns
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏷️  COMMON VULNERABILITY PATTERNS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const tagCount: Record<string, number> = {};
  findings.forEach((finding) => {
    finding.issues_issuetagscore.forEach((tag) => {
      const tagName = tag.tags_tag.title;
      tagCount[tagName] = (tagCount[tagName] || 0) + 1;
    });
  });

  const sortedTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  sortedTags.forEach(([tag, count]) => {
    console.log(`  ${count.toString().padStart(3)} findings: ${tag}`);
  });

  console.log('\n');
  console.log('════════════════════════════════════════════════════════════');
  console.log('✅ Report generation complete!');
  console.log('════════════════════════════════════════════════════════════\n');

  return findings;
}

// Run if called directly
if (require.main === module) {
  generateSecurityReport()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export { searchFindings, findRelevantVulnerabilities, generateSecurityReport };
