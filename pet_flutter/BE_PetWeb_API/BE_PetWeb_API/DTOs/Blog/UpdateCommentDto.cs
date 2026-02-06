namespace BE_PetWeb_API.DTOs.Blog
{
    public class UpdateCommentDto
    {
        public string Content { get; set; }

        public bool? IsApproved { get; set; }
    }
}