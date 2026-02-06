using System;

namespace BE_PetWeb_API.DTOs.Blog
{
    public class CommentDto
    {
        public int CommentId { get; set; }
        public int PostId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string UserAvatar { get; set; }
        public string Content { get; set; }
        public DateTime? CommentDate { get; set; }
        public bool? IsApproved { get; set; }
    }
}