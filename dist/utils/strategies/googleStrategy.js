"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const schoolModel_1 = __importDefault(require("../../model/schoolModel"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const GOOGLE_CLIENT_ID = "938639497902-18ng02iae50d323nd5i0gilva0bl4lqk.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
// const GOOGLE_CLIENT_ID =
//   "76597312158-2o058qto2hgrmbe4ks4a8lbho51i1bd0.apps.googleusercontent.com";
// const GOOGLE_CLIENT_SECRET = "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";
// ${process.env.APP_URL_DEPLOY}
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    // callbackURL:
    //   "https://startschoolbe.onrender.com/api/auth/google/callback",
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield schoolModel_1.default.findOne({
        email: profile === null || profile === void 0 ? void 0 : profile.emails[0].value,
    });
    if (user) {
        return done(null, user);
    }
    else {
        yield schoolModel_1.default.create({
            email: profile === null || profile === void 0 ? void 0 : profile.emails[0].value,
            verify: true,
        });
        return done(null, user);
    }
})));
passport_1.default.serializeUser(function (user, done) {
    done(null, user._id);
});
passport_1.default.deserializeUser(function (user, done) {
    done(null, user._id);
});
