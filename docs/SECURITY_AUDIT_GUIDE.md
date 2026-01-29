# Security Audit Guide

## Using Cyfrin Solodit API for Security Research

The Clash of Clanks project integrates with the Cyfrin Solodit API to leverage thousands of real-world security findings from professional audits.

### What is Solodit?

Solodit is Cyfrin's database of security findings from audits across Code4rena, Sherlock, Cyfrin, and other major audit firms. It contains:
- **10,000+** security findings
- Multiple severity levels (HIGH, MEDIUM, LOW, GAS)
- Tags for vulnerability types
- Real exploit examples
- Remediation guidance

### Setup

1. **API Key Configured**
   Your API key is already in `.env.example`:
   ```bash
   CYFRIN_API_KEY=sk_0486690c20c135c9a01064c3001d793bf201315e79178ba9ebdfeb19069132b5
   ```

2. **Copy to .env**
   ```bash
   cp .env.example .env
   ```

### Running Security Audit

```bash
# Run comprehensive security scan
npm run security:audit

# Or with ts-node directly
npx ts-node scripts/security/solodit-audit.ts
```

### What the Script Does

The security audit script searches Solodit for findings relevant to your contracts:

1. **Searches for vulnerabilities in:**
   - ERC20 tokens
   - Betting/gaming contracts
   - Staking mechanisms
   - Oracle integrations
   - Access control
   - Reentrancy attacks
   - Arithmetic issues
   - Front-running/MEV

2. **Filters results by:**
   - Impact: HIGH and MEDIUM only
   - Language: Solidity only
   - Quality Score: 3+ out of 5
   - Sorted by: Quality (best first)

3. **Generates report with:**
   - Total findings count
   - Breakdown by severity
   - Top 10 HIGH severity issues
   - Common vulnerability patterns
   - Links to full findings

### Sample Output

```
════════════════════════════════════════════════════════════
         🛡️  CLASH OF CLANKS SECURITY AUDIT 🛡️
               Powered by Cyfrin Solodit
════════════════════════════════════════════════════════════

🔍 Searching for relevant security findings...

📖 Searching: ERC20 Token Issues...
   Found 10 findings
📖 Searching: Betting/Gaming Contracts...
   Found 8 findings

📊 Total Findings Retrieved: 80

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 FINDINGS BY SEVERITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 HIGH:     35 findings
🟡 MEDIUM:   45 findings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 TOP HIGH SEVERITY FINDINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Reentrancy in token transfer allows draining
   Quality: 5/5 | Firm: Cyfrin
   Tags: Reentrancy, ERC20
   🔗 https://solodit.xyz/issues/...

2. Oracle manipulation leads to incorrect pricing
   Quality: 5/5 | Firm: Sherlock
   Tags: Oracle, Price Manipulation
   🔗 https://solodit.xyz/issues/...

...
```

### Understanding the Results

#### Severity Levels
- **🔴 HIGH**: Critical issues that could lead to loss of funds
- **🟡 MEDIUM**: Important issues that could affect contract behavior
- **🟢 LOW**: Minor issues or best practice violations

#### Quality Score
- **5/5**: Exceptional finding, likely critical
- **4/5**: Very important finding
- **3/5**: Significant finding
- **1-2/5**: Minor or duplicate finding

#### Common Tags to Watch For
- **Reentrancy**: Attack where external call allows re-entering function
- **Oracle Manipulation**: Exploiting price feed or data sources
- **Access Control**: Unauthorized access to privileged functions
- **Integer Overflow/Underflow**: Arithmetic errors (mostly fixed in Solidity 0.8+)
- **Front-running**: MEV attacks on transactions
- **DOS**: Denial of service attacks
- **Logic Error**: Flaws in business logic

### Using Findings to Improve Security

1. **Review Each High Severity Finding**
   - Read the full description
   - Check if similar pattern exists in your code
   - Implement recommended fix if applicable

2. **Check the Security Checklist**
   See `docs/SECURITY_CHECKLIST.md` for comprehensive list

3. **Update Tests**
   Add test cases for discovered vulnerabilities

4. **Document Mitigations**
   Note in code comments how you've addressed each risk

### Advanced Usage

#### Custom Search

Modify `scripts/security/solodit-audit.ts` to search for specific issues:

```typescript
const data = await searchFindings({
  keywords: 'specific vulnerability name',
  impact: ['HIGH'],
  firms: [{ value: 'Cyfrin' }],
  tags: [{ value: 'Reentrancy' }],
  qualityScore: 4,
  sortField: 'Quality',
  sortDirection: 'Desc'
}, 1, 20);
```

#### Export to JSON

Add to the script:

```typescript
import fs from 'fs';

const findings = await findRelevantVulnerabilities();
fs.writeFileSync(
  'security-findings.json',
  JSON.stringify(findings, null, 2)
);
```

### Rate Limiting

The API has rate limits:
- **20 requests per 60 seconds**
- Script includes 3.5s delays between requests
- Headers show remaining quota

### Integration with CI/CD

Add to your CI pipeline:

```yaml
# .github/workflows/security.yml
- name: Run Security Audit
  run: npm run security:audit
  env:
    CYFRIN_API_KEY: ${{ secrets.CYFRIN_API_KEY }}
```

### Additional Security Tools

Complement Solodit with other tools:

```bash
# Static analysis with Slither (requires Python)
pip3 install slither-analyzer
slither .

# Mythril symbolic execution
docker run -v $(pwd):/tmp mythril/myth analyze /tmp/contracts/

# Test coverage
npm run test:coverage
```

### When to Run Security Audit

- ✅ **Before every deployment** (testnet and mainnet)
- ✅ **After adding new features**
- ✅ **After modifying critical functions**
- ✅ **Before external audit** (catch easy issues first)
- ✅ **After learning about new vulnerability types**

### Getting Help

If you find a critical vulnerability:
1. **DO NOT** deploy to mainnet
2. Review the Solodit finding carefully
3. Implement the fix
4. Add test case for the vulnerability
5. Re-run security audit
6. Consider professional audit before mainnet

### Resources

- **Solodit**: https://solodit.cyfrin.io
- **Cyfrin Docs**: https://docs.cyfrin.io
- **Smart Contract Security**: https://consensys.github.io/smart-contract-best-practices/
- **OpenZeppelin**: https://docs.openzeppelin.com/contracts/

---

**Remember**: The Solodit audit is a starting point, not a replacement for:
- Comprehensive testing
- Code review
- Professional security audit
- Bug bounty program
- Ongoing monitoring
