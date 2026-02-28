import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import type { TemplateProps } from './types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 16,
    borderBottom: '2pt solid #2563eb',
    paddingBottom: 12,
  },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    fontSize: 9,
    color: '#4b5563',
  },
  contactItem: {
    marginRight: 4,
  },
  separator: {
    color: '#d1d5db',
    marginHorizontal: 2,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  entryTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  entrySubtitle: {
    fontSize: 9,
    color: '#6b7280',
  },
  entryDate: {
    fontSize: 9,
    color: '#6b7280',
  },
  bullet: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 8,
  },
  bulletDot: {
    width: 12,
    fontSize: 10,
    color: '#9ca3af',
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.4,
    color: '#374151',
  },
  entry: {
    marginBottom: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skill: {
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 8.5,
  },
  projectTech: {
    fontSize: 8.5,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
  },
});

export function ClassicTemplate({ personalInfo, content }: TemplateProps) {
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
          <Text style={styles.name}>{personalInfo.fullName}</Text>
          <View style={styles.contactRow}>
            {contactItems.map((item, i) => (
              <View key={i} style={{ flexDirection: 'row' }}>
                {i > 0 && <Text style={styles.separator}>|</Text>}
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
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summary}>{content.summary}</Text>
          </View>
        )}

        {content.workExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {content.workExperience.map((job, i) => (
              <View key={i} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <View>
                    <Text style={styles.entryTitle}>{job.position}</Text>
                    <Text style={styles.entrySubtitle}>
                      {job.company}
                      {job.location ? ` -- ${job.location}` : ''}
                    </Text>
                  </View>
                  <Text style={styles.entryDate}>
                    {job.startDate} -- {job.endDate || 'Present'}
                  </Text>
                </View>
                {job.bullets.map((bullet, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletDot}>&#8226;</Text>
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
                    <Text style={styles.bulletDot}>&#8226;</Text>
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
            {content.projects.map((proj, i) => (
              <View key={i} style={styles.entry}>
                <Text style={styles.entryTitle}>
                  {proj.name}
                  {proj.url && <Link src={proj.url} style={styles.link}> ({proj.url.replace(/^https?:\/\/(www\.)?/, '')})</Link>}
                </Text>
                <Text style={styles.bulletText}>{proj.description}</Text>
                <Text style={styles.projectTech}>{proj.technologies.join(', ')}</Text>
              </View>
            ))}
          </View>
        )}

        {content.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
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
