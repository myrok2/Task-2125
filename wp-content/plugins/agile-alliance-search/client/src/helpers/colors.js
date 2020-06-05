/**
 * Returns the corresponding hex value for a given post type
 * @param {string} postType CPT name
 * @return {string} hex color value
 */
export function colorByPostType(postType) {
  const COLORS = {
    LIGHT_BLUE: '#03bbd3',
    PURPLE: '#995fb6',
    YELLOW: '#FFC63E',
    ORANGE: '#f77d16',
    BLUE: '#5798b9',
  };
  const colorMap = {
    page: COLORS.PURPLE,
    post: COLORS.PURPLE,
    aa_book: COLORS.PURPLE,
    aa_community_groups: COLORS.ORANGE,
    aa_event_session: COLORS.PURPLE,
    aa_experience_report: COLORS.PURPLE,
    aa_glossary: COLORS.PURPLE,
    aa_initiative: COLORS.PURPLE,
    aa_organizations: COLORS.BLUE,
    aa_research_paper: COLORS.PURPLE,
    aa_story: COLORS.BLUE,
    aa_video: COLORS.PURPLE,
    aa_podcast: COLORS.BLUE,
    'third-party-event': COLORS.ORANGE,
  };
  return colorMap[postType] ? colorMap[postType] : COLORS.PURPLE;
}

export default {};
