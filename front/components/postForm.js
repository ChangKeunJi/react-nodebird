import { Form, Input, Button } from "antd";
import { useCallback, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  UPLOAD_IMAGES_REQUEST,
  REMOVE_IMAGE,
  ADD_POST_REQUEST,
} from "../reducers/post";
import useInput from "../hooks/useInput";

const PostForm = () => {
  const { imagePaths, addPostDone } = useSelector((state) => state.post);
  const [text, onChangeText, setText] = useInput("");

  const dispatch = useDispatch();

  useEffect(() => {
    // 오직 Request가 완료된 뒤에야 text창을 비워준다.
    if (addPostDone) {
      setText("");
    }
  }, [addPostDone]);

  const onSubmit = useCallback(() => {
    if (!text || !text.trim()) {
      return alert("게시글을 작성해주세요!");
    }
    const formData = new FormData();
    imagePaths.forEach((p) => {
      formData.append("image", p);
    });
    formData.append("content", text);
    // req.body의 key와 value를 만들어준다
    return dispatch({
      type: ADD_POST_REQUEST,
      data: formData,
    });
  }, [text, imagePaths]);

  const imageInput = useRef();

  const onClickImageUpload = useCallback(() => {
    imageInput.current.click();
  }, []);

  // 이미지를 선택하면 실행된다
  const onChangeImages = useCallback((e) => {
    const imageFormData = new FormData(); // multipart 방식
    // forEach 메서드를 배열에서 빌려서 사용한다
    [].forEach.call(e.target.files, (f) => {
      imageFormData.append("image", f); // router.post의 upload.array()의 "image"와 같은 이름을 가져야한다
    });
    dispatch({
      type: UPLOAD_IMAGES_REQUEST,
      data: imageFormData,
    });
  }, []);

  const onRemoveImage = useCallback(
    (index) => () => {
      dispatch({
        type: REMOVE_IMAGE,
        data: index,
      });
    },
    []
  );

  return (
    <Form
      style={{ margin: "10px 0 20px" }}
      encType="multipart/form-data"
      onFinish={onSubmit}
    >
      <Input.TextArea
        value={text}
        onChange={onChangeText}
        maxLength={140}
        placeholder="어떤 신기한 일이 있었나요?"
      />
      <div>
        {/* router.post("/images", isLoggedIn,upload.array('image'), async (req, res, next) => {});
        name="image"때문에 입력받은 image가 upload.array로 들어간다.    */}
        <input
          type="file"
          name="image"
          multiple
          hidden
          ref={imageInput}
          onChange={onChangeImages}
        />
        <Button onClick={onClickImageUpload}>이미지 업로드</Button>
        <Button type="primary" style={{ float: "right" }} htmlType="submit">
          짹짹
        </Button>
      </div>
      <div>
        {imagePaths.map((v, i) => (
          <div key={v} style={{ display: "inline-block" }}>
            <img
              src={`http://localhost:3065/${v}`}
              style={{ width: "200px" }}
              alt={v}
            />
            <div>
              <Button onClick={onRemoveImage(i)}>제거</Button>
            </div>
          </div>
        ))}
      </div>
    </Form>
  );
};

export default PostForm;
