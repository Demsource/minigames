export function SkeletonCommentForm(): HTMLElement {
  const form = document.createElement('div');
  form.className = 'skeleton-comment-form';

  form.innerHTML = `
    <div class="skeleton-comment-avatar"></div>
    <div class="skeleton-comment-textarea"></div>
    <div class="skeleton-comment-submit"></div>
  `;

  return form;
}

export function SkeletonCommentItem(): HTMLElement {
  const item = document.createElement('div');
  item.className = 'skeleton-comment-item';

  item.innerHTML = `
    <div class="skeleton-comment-avatar"></div>
    <div class="skeleton-comment-content">
      <div class="skeleton-comment-header">
        <div class="skeleton-comment-author"></div>
        <div class="skeleton-comment-time"></div>
      </div>
      <div class="skeleton-comment-text"></div>
      <div class="skeleton-comment-text short"></div>
      <div class="skeleton-comment-like"></div>
    </div>
  `;

  return item;
}

export function SkeletonCommentsSection(commentCount: number = 2): HTMLElement {
  const section = document.createElement('div');
  section.className = 'skeleton-comments-section';

  section.innerHTML = `
    <div class="skeleton-comments-header"></div>
    ${SkeletonCommentForm().outerHTML}
    <div class="skeleton-comments-list">
      ${Array.from({ length: commentCount }, () => SkeletonCommentItem().outerHTML).join('')}
    </div>
  `;

  return section;
}
