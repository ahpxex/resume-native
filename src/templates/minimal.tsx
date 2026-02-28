import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import type { TemplateProps } from './types';

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#27272a',
  },
  header: {
    marginBottom: 24,
    textAlign: 'center',
  },
  name: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#09090b',
    letterSpacing: 1,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 6,
    fontSize: 8.5,
    color: '#71717a',
  },
  contactItem: {},
  separator: {
    color: '#d4d4d8',
    marginHorizontal: 2,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 10,
  },
  divider: {
    borderBottom: '0.5pt solid #e4e4e7',
    marginBottom: 10,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#3f3f46',
    textAlign: 'center',
    maxWidth: '85%',
    marginHorizontal: 'auto',
  },
  entry: {
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 3,
  },
  entryTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10.5,
    color: '#18181b',
  },
  entrySubtitle: {
    fontSize: 9,
    color: '#52525b',
    marginBottom: 3,
  },
  entryDate: {
    fontSize: 8.5,
    color: '#a1a1aa',
  },
  bullet: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 10,
    color: '#a1a1aa',
    fontSize: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.5,
    color: '#3f3f46',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
  },
  skill: {
    fontSize: 8.5,
    color: '#52525b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    border: '0.5pt solid #d4d4d8',
  },
  projectTech: {
    fontSize: 8.5,
    color: '#a1a1aa',
    marginTop: 2,
  },
  link: {
    color: '#3b82f6',
    textDecoration: 'none',
  },
});

export function MinimalTemplate({ personalInfo, content }: TemplateProps) {
  const contactItems = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.website,
    personalInfo.linkedin,
    personalInfo.github,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{personalInfo.fullName.toUpperCase()}</Text>
          <View style={styles.contactRow}>
            {contactItems.map((item, i) => (
              <View key={i} style={{ flexDirection: 'row' }}>
                {i > 0 && <Text style={styles.separator}>/</Text>}
                <Text style={styles.contactItem}>
                  {item!.startsWith('http') ? (
                    <Link src={item!} style={styles.link}>{item!.replace(/^https?:\/\/(www\.)?/, '')}</Link>
                  ) : (
                    item
                  )}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {content.summary && (
          <View style={styles.section}>
            <View style={styles.divider} />
            <Text style={styles.summary}>{content.summary}</Text>
          </View>
        )}

        {content.workExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            <View style={styles.divider} />
            {content.workExperience.map((job, i) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{job.position}</Text>
                  <Text style={styles.entryDate}>
                    {job.startDate} -- {job.endDate || 'Present'}
                  </Text>
                </View>
                <Text style={styles.entrySubtitle}>
                  {job.company}{job.location ? `, ${job.location}` : ''}
                </Text>
                {job.bullets.map((bullet, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletDot}>--</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {content.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            <View style={styles.divider} />
            {content.education.map((edu, i) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <View>
                    <Text style={styles.entryTitle}>{edu.degree} in {edu.field}</Text>
                    <Text style={styles.entrySubtitle}>{edu.institution}</Text>
                  </View>
                  <Text style={styles.entryDate}>
                    {edu.startDate} -- {edu.endDate || 'Present'}
                  </Text>
                </View>
                {edu.details?.map((detail, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletDot}>--</Text>
                    <Text style={styles.bulletText}>{detail}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {content.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            <View style={styles.divider} />
            {content.projects.map((proj, i) => (
              <View key={i} style={styles.entry}>
                <Text style={styles.entryTitle}>
                  {proj.name}
                  {proj.url && <Link src={proj.url} style={styles.link}> ({proj.url.replace(/^https?:\/\/(www\.)?/, '')})</Link>}
                </Text>
                <Text style={styles.bulletText}>{proj.description}</Text>
                <Text style={styles.projectTech}>{proj.technologies.join(' / ')}</Text>
              </View>
            ))}
          </View>
        )}

        {content.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.divider} />
            <View style={styles.skillsRow}>
              {content.skills.map((skill, i) => (
                <Text key={i} style={styles.skill}>{skill}</Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
