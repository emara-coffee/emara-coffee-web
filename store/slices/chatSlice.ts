import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  targetChatUser: any | null;
}

const initialState: ChatState = {
  targetChatUser: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setTargetChatUser: (state, action: PayloadAction<any>) => {
      state.targetChatUser = action.payload;
    },
    clearTargetChatUser: (state) => {
      state.targetChatUser = null;
    },
  },
});

export const { setTargetChatUser, clearTargetChatUser } = chatSlice.actions;
export default chatSlice.reducer;