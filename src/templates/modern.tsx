import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import type { TemplateProps } from './types';

const SIDEBAR_COLOR = '#1e3a5f';
const ACCENT_COLOR = '#3b82f6';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  sidebar: {
    width: '32%',
    backgroundColor: SIDEBAR_COLOR,
    color: '#ffffff',
    padding: 24,
    paddingTop: 36,
  },
  main: {
    width: '68%',
    padding: 28,
    paddingTop: 36,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 9,
    color: '#93c5fd',
    marginBottom: 20,
  },
  sidebarSection: {
    marginBottom: 18,
  },
  sidebarTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#93c5fd',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    borderBottom: '1pt solid #2d4a6f',
    paddingBottom: 4,
  },
  contactItem: {
    fontSize: 8.5,
    color: '#d1d5db',
    marginBottom: 5,
    lineHeight: 1.3,
  },
  contactLabel: {
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    fontSize: 8,
    marginBottom: 1,
  },
  skillPill: {
    backgroundColor: '#2d4a6f',
    color: '#e0e7ff',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    fontSize: 8,
    marginBottom: 3,
    marginRight: 3,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mainSection: {
    marginBottom: 16,
  },
  mainSectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: SIDEBAR_COLOR,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    borderBottom: `1.5pt solid ${ACCENT_COLOR}`,
    paddingBottom: 4,
  },
  summary: {
    fontSize: 9.5,
    lineHeight: 1.5,
    color: '#374151',
  },
  entry: {
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  entryTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: '#111827',
  },
  entrySubtitle: {
    fontSize: 9,
    color: '#6b7280',
  },
  entryDate: {
    fontSize: 8.5,
    color: '#6b7280',
  },
  bullet: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 6,
  },
  bulletDot: {
    width: 10,
    color: ACCENT_COLOR,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
    color: '#374151',
  },
  projectDescription: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#374151',
    marginTop: 1,
  },
  projectTech: {
    fontSize: 8,
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 1,
  },
  link: {
    color: '#93c5fd',
    textDecoration: 'none',
  },
});

export function ModernTemplate({ personalInfo, content }: TemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.name}>{personalInfo.fullName}</Text>
          {content.summary && (
            <Text style={styles.tagline}>{content.summary.split('.')[0]}.</Text>
          )}

          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarTitle}>Contact</Text>
            {personalInfo.email && (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactItem}>{personalInfo.email}</Text>
              </View>
            )}
            {personalInfo.phone && (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactItem}>{personalInfo.phone}</Text>
              </View>
            )}
            {personalInfo.location && (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.contactLabel}>Location</Text>
                <Text style={styles.contactItem}>{personalInfo.location}</Text>
              </View>
            )}
            {personalInfo.website && (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.contactLabel}>Website</Text>
                <Link src={personalInfo.website} style={{ ...styles.contactItem, ...styles.link }}>
                  {personalInfo.website.replace(/^https?:\/\/(www\.)?/, '')}
                </Link>
              </View>
            )}
            {personalInfo.linkedin && (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.contactLabel}>LinkedIn</Text>
                <Link src={personalInfo.linkedin} style={{ ...styles.contactItem, ...styles.link }}>
                  {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                </Link>
              </View>
            )}
            {personalInfo.github && (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.contactLabel}>GitHub</Text>
                <Link src={personalInfo.github} style={{ ...styles.contactItem, ...styles.link }}>
                  {personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}
                </Link>
              </View>
            )}
          </View>

          {content.skills.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Skills</Text>
              <View style={styles.skillsWrap}>
                {content.skills.map((skill, i) => (
                  <Text key={i} style={styles.skillPill}>{skill}</Text>
                ))}
              </View>
            </View>
          )}

          {content.education.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Education</Text>
              {content.education.map((edu, i) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#ffffff' }}>
                    {edu.degree}
                  </Text>
                  <Text style={{ fontSize: 8.5, color: '#d1d5db' }}>
                    {edu.field}
                  </Text>
                  <Text style={{ fontSize: 8, color: '#9ca3af' }}>
                    {edu.institution}
                  </Text>
                  <Text style={{ fontSize: 7.5, color: '#9ca3af' }}>
                    {edu.startDate} - {edu.endDate || 'Present'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Main content */}
        <View style={styles.main}>
          {content.summary && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Profile</Text>
              <Text style={styles.summary}>{content.summary}</Text>
            </View>
          )}

          {content.workExperience.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Experience</Text>
              {content.workExperience.map((job, i) => (
                <View key={i} style={styles.entry}>
                  <View style={styles.entryHeader}>
                    <View>
                      <Text style={styles.entryTitle}>{job.position}</Text>
                      <Text style={styles.entrySubtitle}>
                        {job.company}{job.location ? ` -- ${job.location}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.entryDate}>
                      {job.startDate} - {job.endDate || 'Present'}
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

          {content.projects.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Projects</Text>
              {content.projects.map((proj, i) => (
                <View key={i} style={styles.entry}>
                  <Text style={styles.entryTitle}>{proj.name}</Text>
                  <Text style={styles.projectDescription}>{proj.description}</Text>
                  <Text style={styles.projectTech}>{proj.technologies.join(', ')}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}
