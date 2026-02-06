using System;
using System.Collections.Generic;

namespace BE_PetWeb_API.DTOs.Blog
{
    public class BlogPostDto
    {
        public int PostId { get; set; }
        public int UserId { get; set; }
        public string AuthorName { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string FeaturedImage { get; set; }
        public string Category { get; set; }
        public string Tags { get; set; }
        public DateTime? PublishDate { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string Status { get; set; }
        public int? ViewCount { get; set; }
        public List<CommentDto> Comments { get; set; } = new List<CommentDto>();
    }
}